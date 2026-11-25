import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Play, FileText, Download, Search, RefreshCw, X,
  ChevronLeft, Film, BookOpen, Clock, HardDrive, ExternalLink, AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import styles from './TelegramMediaPage.module.css';

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

export default function TelegramMediaPage() {
  const [items, setItems] = useState([]);
  const [groupTitle, setGroupTitle] = useState('Study Group Library');
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

  const fetchFeed = async (reset = true, offset = 0, selectedType = filter) => {
    try {
      if (reset) {
        setLoading(true);
        setError('');
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        limit: '30',
        type: selectedType,
      });
      if (offset) params.set('offsetId', String(offset));

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
    fetchFeed(true, 0, filter);
  }, [filter]);

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
    <div className={styles.page}>
      <Navbar />

      <main className={styles.container}>
        {/* Header */}
        <div className={styles.hero}>
          <div className={styles.heroTop}>
            <Link to="/home" className={styles.backBtn}>
              <ChevronLeft size={16} />
              <span>Back to Home</span>
            </Link>
            <button
              className={styles.refreshBtn}
              onClick={() => fetchFeed(true, 0, filter)}
              disabled={loading}
            >
              <RefreshCw size={15} className={loading ? styles.spin : ''} />
              <span>Refresh</span>
            </button>
          </div>

          <div className={styles.heroTitleRow}>
            <div className={styles.heroIcon}>
              <Film size={28} />
            </div>
            <div>
              <h1 className={styles.heroTitle}>{groupTitle}</h1>
              <p className={styles.heroSub}>
                Watch lecture videos & read PDF notes directly on the website — streamed live from Telegram.
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
              onClick={() => setFilter('all')}
            >
              All Media
            </button>
            <button
              className={`${styles.filterTab} ${filter === 'video' ? styles.filterTabActive : ''}`}
              onClick={() => setFilter('video')}
            >
              <Play size={14} />
              <span>Videos</span>
            </button>
            <button
              className={`${styles.filterTab} ${filter === 'pdf' ? styles.filterTabActive : ''}`}
              onClick={() => setFilter('pdf')}
            >
              <FileText size={14} />
              <span>PDFs & Notes</span>
            </button>
          </div>

          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search lectures, PDFs, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            {search && (
              <button className={styles.clearSearch} onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Setup Needed Notice */}
        {!configured && !loading && (
          <div className={styles.setupCard}>
            <div className={styles.setupHeader}>
              <AlertCircle size={22} />
              <h2>Telegram Group Connection Setup (100% Free)</h2>
            </div>
            <p className={styles.setupDesc}>
              The player is ready! Connect your Telegram group in 3 free steps on your backend server:
            </p>
            <ol className={styles.setupSteps}>
              <li>
                Get your free <code>TELEGRAM_API_ID</code> &amp; <code>TELEGRAM_API_HASH</code> from{' '}
                <a href="https://my.telegram.org" target="_blank" rel="noreferrer">my.telegram.org</a>.
              </li>
              <li>
                Run <code>node generate_telegram_session.js</code> inside the <code>backend/</code> folder to get your free <code>TELEGRAM_SESSION_STRING</code> and Group ID.
              </li>
              <li>
                Add <code>TELEGRAM_API_ID</code>, <code>TELEGRAM_API_HASH</code>, <code>TELEGRAM_SESSION_STRING</code>, and <code>TELEGRAM_GROUP_ID</code> to your Render/backend environment variables and redeploy.
              </li>
            </ol>
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
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className={styles.skeletonCard} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && configured && !error && filteredItems.length === 0 && (
          <div className={styles.emptyState}>
            <BookOpen size={40} />
            <h3>No media found</h3>
            <p>
              {search
                ? `No videos or PDFs matched "${search}".`
                : 'No videos or PDFs have been posted in the connected Telegram group yet.'}
            </p>
          </div>
        )}

        {/* Media Grid */}
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
                            <Film size={36} />
                          </div>
                        )}
                        <div className={styles.playOverlay}>
                          <div className={styles.playCircle}>
                            <Play size={22} fill="currentColor" />
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
                        <FileText size={40} />
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
                        className={styles.watchBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaybackRate(1);
                          setActiveMedia(item);
                        }}
                      >
                        {item.type === 'video' ? (
                          <>
                            <Play size={14} /> <span>Play Now</span>
                          </>
                        ) : (
                          <>
                            <BookOpen size={14} /> <span>Open &amp; Read</span>
                          </>
                        )}
                      </button>
                      <a
                        href={streamUrl(item.id, true)}
                        download={item.fileName || undefined}
                        className={styles.downloadIconBtn}
                        title="Download"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={15} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && nextOffsetId && (
              <div className={styles.loadMoreWrap}>
                <button
                  className={styles.loadMoreBtn}
                  onClick={() => fetchFeed(false, nextOffsetId, filter)}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load Older Posts'}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Built-In Media Player Modal (Video + PDF) */}
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
                <a
                  href={streamUrl(activeMedia.id, true)}
                  download={activeMedia.fileName || undefined}
                  className={styles.modalDownloadBtn}
                >
                  <Download size={15} />
                  <span>Download</span>
                </a>
                <a
                  href={streamUrl(activeMedia.id, false)}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.modalDownloadBtn}
                >
                  <ExternalLink size={15} />
                  <span>New Tab</span>
                </a>
                <button
                  className={styles.modalCloseBtn}
                  onClick={() => setActiveMedia(null)}
                  aria-label="Close player"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className={styles.playerStage}>
              {activeMedia.type === 'video' ? (
                <>
                  <video
                    ref={videoRef}
                    key={activeMedia.id}
                    src={streamUrl(activeMedia.id)}
                    controls
                    autoPlay
                    playsInline
                    className={styles.videoPlayer}
                  />
                  <div className={styles.speedBar}>
                    <span>Speed:</span>
                    {[1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <button
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

      <BottomNav />
    </div>
  );
}
