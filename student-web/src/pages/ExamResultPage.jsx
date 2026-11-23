import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, BookOpen, Clock, Award, ChevronLeft, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import biochemistryResults from '../data/biochemistry_results.json';
import microbiologyResults from '../data/microbiology_results.json';
import anatomyResults from '../data/clinical_anatomy_results.json';
import styles from './ExamResultPage.module.css';

const SUBJECTS = [
  { id: 'biochemistry', title: 'Biochemistry 2026', data: biochemistryResults },
  { id: 'microbiology', title: 'Microbiology CBT 2026', data: microbiologyResults },
  { id: 'anatomy', title: 'Clinical Anatomy 2026', data: anatomyResults },
];

export default function ExamResultPage() {
  const [query, setQuery] = useState('');
  const [activeSubjectId, setActiveSubjectId] = useState('biochemistry');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentSubject = SUBJECTS.find(s => s.id === activeSubjectId) || SUBJECTS[0];

  const filteredResults = useMemo(() => {
    if (!query || query.trim().length === 0) {
      return currentSubject.data;
    }
    const term = query.toLowerCase().trim();
    return currentSubject.data.filter(item => 
      item.name.toLowerCase().includes(term) || 
      item.group.toLowerCase().includes(term)
    );
  }, [query, currentSubject]);

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
              <span>{currentSubject.title}</span>
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
          {filteredResults.length === 0 ? (
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
                      <span className={styles.cardSubjectTitle}>{currentSubject.title}</span>
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
