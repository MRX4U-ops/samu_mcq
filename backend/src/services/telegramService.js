const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const bigInt = require('big-integer');
const {
  TELEGRAM_API_ID,
  TELEGRAM_API_HASH,
  TELEGRAM_SESSION_STRING,
  TELEGRAM_GROUP_ID,
} = require('../config/env');

let client = null;
let connectingPromise = null;
let cachedEntity = null;
const feedCache = new Map();
const CACHE_TTL_MS = 45 * 1000;

function isConfigured() {
  return Boolean(
    TELEGRAM_API_ID &&
    TELEGRAM_API_HASH &&
    TELEGRAM_SESSION_STRING &&
    TELEGRAM_GROUP_ID
  );
}

async function getClient() {
  if (!isConfigured()) {
    throw new Error(
      'Telegram MTProto is not configured. Set TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_SESSION_STRING, and TELEGRAM_GROUP_ID.'
    );
  }

  if (client && client.connected) {
    return client;
  }

  if (connectingPromise) {
    return connectingPromise;
  }

  connectingPromise = (async () => {
    try {
      const session = new StringSession(TELEGRAM_SESSION_STRING);
      const tgClient = new TelegramClient(session, TELEGRAM_API_ID, TELEGRAM_API_HASH, {
        connectionRetries: 5,
      });
      await tgClient.connect();
      client = tgClient;
      return client;
    } finally {
      connectingPromise = null;
    }
  })();

  return connectingPromise;
}

async function getGroupEntity() {
  if (cachedEntity) return cachedEntity;
  const tgClient = await getClient();

  const rawId = TELEGRAM_GROUP_ID;
  try {
    // Support @username, t.me/link, or numeric chat/channel ID
    const target = /^-?\d+$/.test(rawId) ? bigInt(rawId) : rawId;
    cachedEntity = await tgClient.getEntity(target);
    return cachedEntity;
  } catch (err) {
    // Fallback: search dialogs by matching ID or title
    const dialogs = await tgClient.getDialogs({ limit: 100 });
    const match = dialogs.find((d) => {
      const idStr = d.id ? d.id.toString() : '';
      return (
        idStr === rawId ||
        idStr === rawId.replace(/^-100/, '') ||
        (d.title && d.title.toLowerCase() === rawId.toLowerCase())
      );
    });
    if (match && match.entity) {
      cachedEntity = match.entity;
      return cachedEntity;
    }
    throw new Error(`Could not resolve Telegram group "${rawId}": ${err.message}`);
  }
}

function parseMediaMessage(msg) {
  if (!msg || !msg.media || !msg.media.document) return null;

  const doc = msg.media.document;
  const mimeType = doc.mimeType || '';
  const size = Number(doc.size || 0);
  const attrs = doc.attributes || [];

  let fileName = '';
  let isVideo = false;
  let duration = 0;

  for (const attr of attrs) {
    if (attr.className === 'DocumentAttributeFilename' && attr.fileName) {
      fileName = attr.fileName;
    }
    if (attr.className === 'DocumentAttributeVideo') {
      isVideo = true;
      duration = Number(attr.duration || 0);
    }
  }

  const lowerName = fileName.toLowerCase();
  const isPdf = mimeType === 'application/pdf' || lowerName.endsWith('.pdf');
  const isVideoFile =
    isVideo ||
    mimeType.startsWith('video/') ||
    /\.(mp4|mkv|webm|mov|avi)$/i.test(lowerName);

  if (!isVideoFile && !isPdf) {
    // Also allow common study document formats
    const isStudyDoc = /\.(docx?|pptx?|xlsx?|txt)$/i.test(lowerName);
    if (!isStudyDoc) return null;
  }

  const category = isVideoFile ? 'video' : isPdf ? 'pdf' : 'document';
  const caption = msg.message || '';
  const title =
    fileName ||
    (caption ? caption.split('\n')[0].trim().slice(0, 90) : `${category.toUpperCase()} #${msg.id}`);

  return {
    id: msg.id,
    type: category,
    title,
    caption,
    fileName,
    mimeType: mimeType || (isPdf ? 'application/pdf' : 'video/mp4'),
    size,
    duration,
    date: msg.date ? new Date(msg.date * 1000).toISOString() : null,
    hasThumb: Boolean(doc.thumbs && doc.thumbs.length > 0),
  };
}

async function getGroupMedia({ limit = 40, offsetId = 0, type = 'all' } = {}) {
  const cacheKey = `${limit}:${offsetId}:${type}`;
  const cached = feedCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const tgClient = await getClient();
  const entity = await getGroupEntity();

  // Fetch a slightly larger batch if filtering so user gets enough items
  const fetchLimit = type === 'all' ? Math.min(limit * 2, 100) : Math.min(limit * 3, 120);
  const messages = await tgClient.getMessages(entity, {
    limit: fetchLimit,
    offsetId: offsetId ? Number(offsetId) : undefined,
  });

  const items = [];
  let oldestMessageId = null;

  for (const msg of messages) {
    oldestMessageId = msg.id;
    const parsed = parseMediaMessage(msg);
    if (!parsed) continue;
    if (type !== 'all' && parsed.type !== type) continue;
    items.push(parsed);
    if (items.length >= limit) break;
  }

  const result = {
    groupTitle: entity.title || TELEGRAM_GROUP_ID,
    items,
    nextOffsetId: messages.length > 0 ? oldestMessageId : null,
    hasMore: messages.length === fetchLimit,
  };

  feedCache.set(cacheKey, { ts: Date.now(), data: result });
  return result;
}

async function streamMedia(messageId, req, res) {
  const tgClient = await getClient();
  const entity = await getGroupEntity();

  const msgs = await tgClient.getMessages(entity, { ids: [Number(messageId)] });
  const msg = msgs && msgs[0];
  if (!msg || !msg.media || !msg.media.document) {
    return res.status(404).json({ error: 'Media not found' });
  }

  const doc = msg.media.document;
  const totalSize = Number(doc.size || 0);
  let mimeType = doc.mimeType || 'application/octet-stream';

  let fileName = `media_${messageId}`;
  for (const attr of doc.attributes || []) {
    if (attr.className === 'DocumentAttributeFilename' && attr.fileName) {
      fileName = attr.fileName;
    }
  }
  if (fileName.toLowerCase().endsWith('.pdf')) {
    mimeType = 'application/pdf';
  }

  const isDownload = req.query.download === '1';
  const disposition = isDownload ? 'attachment' : 'inline';

  const rangeHeader = req.headers.range;
  if (rangeHeader && totalSize > 0) {
    const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    if (!match) {
      return res.status(416).set('Content-Range', `bytes */${totalSize}`).end();
    }

    const start = parseInt(match[1], 10);
    // Stream up to 2MB per range chunk for responsive seeking
    const maxChunk = 2 * 1024 * 1024;
    const requestedEnd = match[2] ? parseInt(match[2], 10) : start + maxChunk - 1;
    const end = Math.min(requestedEnd, totalSize - 1);

    if (start >= totalSize || start > end) {
      return res.status(416).set('Content-Range', `bytes */${totalSize}`).end();
    }

    const chunkLength = end - start + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${totalSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkLength,
      'Content-Type': mimeType,
      'Content-Disposition': `${disposition}; filename="${encodeURIComponent(fileName)}"`,
      'Cache-Control': 'public, max-age=3600',
    });

    // GramJS iterDownload requires offset aligned to 4096 bytes
    const alignOffset = Math.floor(start / 4096) * 4096;
    let skipBytes = start - alignOffset;
    let sentBytes = 0;

    const iter = tgClient.iterDownload({
      file: msg.media,
      offset: bigInt(alignOffset),
      requestSize: 512 * 1024,
      fileSize: doc.size,
    });

    for await (const chunk of iter) {
      if (res.destroyed || res.writableEnded) break;

      let buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      if (skipBytes > 0) {
        if (buf.length <= skipBytes) {
          skipBytes -= buf.length;
          continue;
        }
        buf = buf.subarray(skipBytes);
        skipBytes = 0;
      }

      const remaining = chunkLength - sentBytes;
      if (buf.length > remaining) {
        buf = buf.subarray(0, remaining);
      }

      res.write(buf);
      sentBytes += buf.length;
      if (sentBytes >= chunkLength) break;
    }

    res.end();
    return;
  }

  // Full file stream (used by PDFs or direct downloads)
  res.writeHead(200, {
    'Accept-Ranges': 'bytes',
    'Content-Length': totalSize,
    'Content-Type': mimeType,
    'Content-Disposition': `${disposition}; filename="${encodeURIComponent(fileName)}"`,
    'Cache-Control': 'public, max-age=3600',
  });

  const iter = tgClient.iterDownload({
    file: msg.media,
    offset: bigInt(0),
    requestSize: 512 * 1024,
    fileSize: doc.size,
  });

  for await (const chunk of iter) {
    if (res.destroyed || res.writableEnded) break;
    res.write(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  res.end();
}

async function getThumbnail(messageId, res) {
  const tgClient = await getClient();
  const entity = await getGroupEntity();

  const msgs = await tgClient.getMessages(entity, { ids: [Number(messageId)] });
  const msg = msgs && msgs[0];
  if (!msg || !msg.media || !msg.media.document || !msg.media.document.thumbs?.length) {
    return res.status(404).end();
  }

  const buffer = await tgClient.downloadMedia(msg, { thumb: 0 });
  if (!buffer) return res.status(404).end();

  res.set('Content-Type', 'image/jpeg');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(buffer);
}

module.exports = {
  isConfigured,
  getGroupMedia,
  streamMedia,
  getThumbnail,
};
