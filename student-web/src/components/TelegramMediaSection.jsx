import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Play, FileText, Download, Search, RefreshCw, X,
  Film, BookOpen, Clock, HardDrive, ExternalLink, AlertCircle
} from 'lucide-react';
import styles from './TelegramMediaSection.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://samu-mcqs.onrender.com';

function formatBytes(bytes) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let idx = 0;
  let val = bytes;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx++;
  }
  return `${val.toFixed(idx >= 2 ? 1 : 0)} ${units[idx]}`;
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function TelegramMediaSection({ compact = false, initialLimit = 300 }) {
  const [items, setItems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(0);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [groupTitle, setGroupTitle] = useState('SAMU TIGERS');
  const [filter, setFilter] = useState('all'); // 'all' | 'video' | 'pdf'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [error, setError] = useState('');
  const [nextOffsetId, setNextOffsetId] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const [activeMedia, setActiveMedia] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef(null);

  const fetchTopics = async (forceRefresh = false) => {
    try {
      const qs = forceRefresh ? '?refresh=1' : '';
      const res = await fetch(`${API_BASE_URL}/api/telegram/topics${qs}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.groupTitle) setGroupTitle(data.groupTitle);
      if (Array.isArray(data.topics)) setTopics(data.topics);
    } catch {
      // handled by feed call
    }
  };

  const fetchFeed = async (reset = true, offset = 0, selectedType = filter, topicId = selectedTopicId, forceRefresh = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError('');
      } else {
        setLoadingMore(true);
      }

      const limitToFetch = topicId > 0 ? Math.max(initialLimit, 300) : 40;
      const params = new URLSearchParams({
        limit: String(limitToFetch),
        type: selectedType,
      });
      if (offset) params.set('offsetId', String(offset));
      if (topicId) params.set('topicId', String(topicId));
      if (forceRefresh) params.set('refresh', '1');

      const res = await fetch(`${API_BASE_URL}/api/telegram/feed?${params.toString()}`);
      const data = await res.json();

      if (res.status === 503 || data.configured === false) {
        setConfigured(false);
        setItems([]);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Telegram group media');
      }

      setConfigured(true);
      if (data.groupTitle) setGroupTitle(data.groupTitle);
      setItems((prev) => (reset ? data.items || [] : [...prev, ...(data.items || [])]));
      setNextOffsetId(data.nextOffsetId || null);
      setHasMore(Boolean(data.hasMore));
    } catch (err) {
      setError(err.message || 'Unable to connect to Telegram library');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    fetchFeed(true, 0, filter, selectedTopicId);
  }, [filter, selectedTopicId]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, activeMedia]);

  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.caption && item.caption.toLowerCase().includes(q)) ||
      (item.fileName && item.fileName.toLowerCase().includes(q))
    );
  });

  const streamUrl = (id, download = false) =>
    `${API_BASE_URL}/api/telegram/stream/${id}${download ? '?download=1' : ''}`;

  return (
    <section className={styles.wrapper}>
      {/* Section Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <div className={styles.headerBadge}>
            <Film size={16} />
            <span>{groupTitle} • LIVE LECTURES &amp; PDFs</span>
          </div>
          <p className={styles.headerSub}>
            Select a subject folder to watch lecture videos &amp; open PDFs directly here
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => {
              fetchTopics(true);
              fetchFeed(true, 0, filter, selectedTopicId, true);
            }}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? styles.spin : ''} />
            <span>Refresh</span>
          </button>
          {compact && (
            <Link to="/telegram-media" className={styles.fullViewBtn}>
              <span>Full Library</span>
              <ExternalLink size={13} />
            </Link>
          )}
        </div>
      </div>

      {/* Subject Topics Bar */}
      {topics.length > 0 && (
        <div className={styles.topicsSection}>
          <div className={styles.topicsHeaderRow}>
            <span className={styles.topicsCount}>Subjects ({topics.length})</span>
            {topics.length > 10 && (
              <button
                type="button"
                className={styles.toggleTopicsBtn}
                onClick={() => setShowAllTopics((v) => !v)}
              >
                {showAllTopics ? 'Show Less ▲' : `Show All ${topics.length} Subjects ▼`}
              </button>
            )}
          </div>
          <div className={showAllTopics ? styles.topicsGrid : styles.topicsRow}>
            <button
              type="button"
              className={`${styles.topicChip} ${selectedTopicId === 0 ? styles.topicChipActive : ''}`}
              onClick={() => setSelectedTopicId(0)}
            >
              All Subjects
            </button>
            {topics.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`${styles.topicChip} ${selectedTopicId === t.id ? styles.topicChipActive : ''}`}
                onClick={() => setSelectedTopicId(t.id)}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search */}
      <div className={styles.controls}>
        <div className={styles.filterTabs}>
          <button
            type="button"
            className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
            onClick={() => setFilter('all')}
          >
            All Media
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${filter === 'video' ? styles.filterTabActive : ''}`}
            onClick={() => setFilter('video')}
          >
            <Play size={13} />
            <span>Videos</span>
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${filter === 'pdf' ? styles.filterTabActive : ''}`}
            onClick={() => setFilter('pdf')}
          >
            <FileText size={13} />
            <span>PDFs &amp; Notes</span>
          </button>
        </div>

        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Filter lectures, PDFs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button type="button" className={styles.clearSearch} onClick={() => setSearch('')}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Not configured */}
      {!configured && !loading && (
        <div className={styles.infoBox}>
          <AlertCircle size={18} />
          <span>Telegram group sync is waiting for backend environment variables.</span>
        </div>
      )}

      {/* Error */}
      {error && configured && (
        <div className={styles.errorBox}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={styles.skeletonCard} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && configured && !error && filteredItems.length === 0 && (
        <div className={styles.emptyState}>
          <BookOpen size={32} />
          <p>
            {search
              ? `No videos or PDFs matched "${search}".`
              : 'No videos or PDFs found in this subject topic.'}
          </p>
        </div>
      )}

      {/* Media Cards */}
      {!loading && filteredItems.length > 0 && (
        <>
          <div className={styles.grid}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={styles.card}
                onClick={() => {
                  setPlaybackRate(1);
                  setActiveMedia(item);
                }}
              >
                <div className={styles.thumbWrap}>
                  {item.type === 'video' ? (
                    <>
                      {item.hasThumb ? (
                        <img
                          src={`${API_BASE_URL}/api/telegram/thumb/${item.id}`}
                          alt={item.title}
                          className={styles.thumbImg}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.videoPlaceholder}>
                          <Film size={32} />
                        </div>
                      )}
                      <div className={styles.playOverlay}>
                        <div className={styles.playCircle}>
                          <Play size={20} fill="currentColor" />
                        </div>
                      </div>
                      {item.duration > 0 && (
                        <span className={styles.durationBadge}>
                          {formatDuration(item.duration)}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className={styles.pdfPlaceholder}>
                      <FileText size={34} />
                      <span className={styles.pdfBadge}>
                        {item.type === 'pdf' ? 'PDF DOCUMENT' : 'STUDY FILE'}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  {item.caption && item.caption !== item.title && (
                    <p className={styles.cardCaption}>{item.caption}</p>
                  )}

                  <div className={styles.cardMeta}>
                    {item.size > 0 && (
                      <span>
                        <HardDrive size={12} /> {formatBytes(item.size)}
                      </span>
                    )}
                    {item.date && (
                      <span>
                        <Clock size={12} /> {formatDate(item.date)}
                      </span>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.watchBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaybackRate(1);
                        setActiveMedia(item);
                      }}
                    >
                      {item.type === 'video' ? (
                        <>
                          <Play size={14} /> <span>Play Here</span>
                        </>
                      ) : (
                        <>
                          <BookOpen size={14} /> <span>Open PDF</span>
                        </>
                      )}
                    </button>
                    {item.type !== 'video' && (
                      <a
                        href={streamUrl(item.id, true)}
                        download={item.fileName || undefined}
                        className={styles.downloadIconBtn}
                        title="Download PDF"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && nextOffsetId && (
            <div className={styles.loadMoreWrap}>
              <button
                type="button"
                className={styles.loadMoreBtn}
                onClick={() => fetchFeed(false, nextOffsetId, filter, selectedTopicId)}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More Lectures'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Built-in Player Modal (Video + PDF) */}
      {activeMedia && (
        <div className={styles.modalBackdrop} onClick={() => setActiveMedia(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleWrap}>
                <span className={styles.modalTypePill}>
                  {activeMedia.type === 'video' ? 'VIDEO PLAYER' : 'PDF VIEWER'}
                </span>
                <h2 className={styles.modalTitle}>{activeMedia.title}</h2>
              </div>

              <div className={styles.modalHeaderBtns}>
                {activeMedia.type !== 'video' && (
                  <>
                    <a
                      href={streamUrl(activeMedia.id, true)}
                      download={activeMedia.fileName || undefined}
                      className={styles.modalDownloadBtn}
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </a>
                    <a
                      href={streamUrl(activeMedia.id, false)}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.modalDownloadBtn}
                    >
                      <ExternalLink size={14} />
                      <span>New Tab</span>
                    </a>
                  </>
                )}
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => setActiveMedia(null)}
                  aria-label="Close player"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className={styles.playerStage} onContextMenu={(e) => e.preventDefault()}>
              {activeMedia.type === 'video' ? (
                <>
                  <video
                    ref={videoRef}
                    key={activeMedia.id}
                    src={streamUrl(activeMedia.id)}
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    autoPlay
                    playsInline
                    className={styles.videoPlayer}
                  />
                  <div className={styles.speedBar}>
                    <span>Speed:</span>
                    {[1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <button
                        type="button"
                        key={rate}
                        className={`${styles.speedBtn} ${playbackRate === rate ? styles.speedBtnActive : ''}`}
                        onClick={() => setPlaybackRate(rate)}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <iframe
                  src={streamUrl(activeMedia.id)}
                  title={activeMedia.title}
                  className={styles.pdfFrame}
                />
              )}
            </div>

            {activeMedia.caption && (
              <div className={styles.modalCaption}>
                <p>{activeMedia.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
