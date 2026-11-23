import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, BookOpen, Clock, Award, ChevronLeft, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import styles from './ExamResultPage.module.css';

const SUBJECTS = [
  { id: 'biochemistry',  title: 'Biochemistry 2026',    file: () => import('../data/biochemistry_results.json') },
  { id: 'microbiology',  title: 'Microbiology CBT 2026', file: () => import('../data/microbiology_results.json') },
  { id: 'anatomy',       title: 'Clinical Anatomy 2026', file: () => import('../data/clinical_anatomy_results.json') },
];

export default function ExamResultPage() {
  const [query, setQuery] = useState('');
  const [activeSubjectId, setActiveSubjectId] = useState('biochemistry');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [subjectData, setSubjectData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load only the selected subject's data on demand
  useEffect(() => {
    setLoadingData(true);
    const subj = SUBJECTS.find(s => s.id === activeSubjectId);
    subj.file().then(mod => {
      setSubjectData(mod.default || mod);
      setLoadingData(false);
    });
  }, [activeSubjectId]);

  const currentSubjectTitle = SUBJECTS.find(s => s.id === activeSubjectId)?.title || '';

  const filteredResults = useMemo(() => {
    if (!query || query.trim().length === 0) return subjectData;
    const term = query.toLowerCase().trim();
    return subjectData.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.group.toLowerCase().includes(term)
    );
  }, [query, subjectData]);

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/home" className={styles.backBtn}>
            <ChevronLeft size={24} />
            <span>Back</span>
          </Link>
          <h1 className={styles.title}>Exam Results</h1>
        </div>

        <div className={styles.dropdownContainer}>
          <button 
            className={styles.dropdownBtn}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className={styles.dropdownTitle}>
              <BookOpen size={20} color="var(--accent-blue)" />
              <span>{currentSubjectTitle}</span>
            </div>
            {isDropdownOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdownList}>
              {SUBJECTS.map((subj) => (
                <button
                  key={subj.id}
                  className={`${styles.dropdownItem} ${activeSubjectId === subj.id ? styles.activeItem : ''}`}
                  onClick={() => {
                    setActiveSubjectId(subj.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  {subj.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.searchContainer}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search your name or group..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.resultsList}>
          {loadingData ? (
            <div style={{textAlign:'center',padding:'40px',color:'#6B7280'}}>Loading results...</div>
          ) : filteredResults.length === 0 ? (
            <div className={styles.empty}>
              <XCircle size={48} color="#EF4444" />
              <h2 className={styles.emptyTitle}>No records found</h2>
              <p className={styles.emptySub}>
                {query.trim().length > 0 
                  ? `We couldn't find any results matching "${query}".`
                  : "No results currently available."}
              </p>
            </div>
          ) : (
            filteredResults.map((item, index) => {
              const isPassed = item.score !== null && item.score >= 60;
              return (
                <div key={index} className={styles.resultCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleWrap}>
                      <BookOpen size={16} color="var(--accent-blue)" />
                      <span className={styles.cardSubjectTitle}>{currentSubjectTitle}</span>
                    </div>
                    <div className={`${styles.badge} ${isPassed ? styles.badgePassed : styles.badgeFailed}`}>
                      {isPassed ? 'Passed' : 'Failed'}
                    </div>
                  </div>

                  <h3 className={styles.studentName}>{item.name}</h3>
                  <p className={styles.studentGroup}>Group: {item.group.toUpperCase()}</p>

                  <div className={styles.divider} />

                  <div className={styles.statsRow}>
                    <div className={styles.statCol}>
                      <span className={styles.statLabel}>Score</span>
                      <div className={styles.scoreRow}>
                        <Award size={16} color={isPassed ? '#10B981' : '#EF4444'} />
                        <span className={styles.scoreValue}>
                          {item.score !== null ? item.score.toFixed(1) : '-'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.statCol}>
                      <span className={styles.statLabel}>Duration</span>
                      <div className={styles.scoreRow}>
                        <Clock size={16} color="var(--text-muted)" />
                        <span className={styles.durationValue}>{item.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.timeInfoRow}>
                    <span className={styles.timeText}>Started: {item.startTime}</span>
                    <span className={styles.timeText}>Finished: {item.endTime}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
