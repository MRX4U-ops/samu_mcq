import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { Search, Pill, ShieldAlert, HeartPulse, Activity, Brain, Bookmark, Share2, Info, Check, ChevronLeft, Bot } from 'lucide-react';
import { searchDrugs, DRUG_CLASSES } from '../data/drugDatabase';
import styles from './DrugReferencePage.module.css';

export default function DrugReferencePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [savedDrugs, setSavedDrugs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('samu_saved_drugs')) || []; }
    catch { return []; }
  });

  // Derived state
  const results = useMemo(() => {
    let list = searchDrugs(query || 'a'); // Show all if empty (just a hack to show something)
    if (!query) list = searchDrugs(' ').slice(0, 10); // initial popular list
    if (selectedClass !== 'All') {
      list = list.filter(d => d.class.includes(selectedClass));
    }
    return list;
  }, [query, selectedClass]);

  const toggleSave = (id) => {
    setSavedDrugs(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('samu_saved_drugs', JSON.stringify(next));
      return next;
    });
  };

  const isSaved = (id) => savedDrugs.includes(id);

  if (selectedDrug) {
    return <DrugDetailView drug={selectedDrug} onBack={() => setSelectedDrug(null)} isSaved={isSaved(selectedDrug.id)} toggleSave={() => toggleSave(selectedDrug.id)} />;
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}><Pill size={24} color="#fff" /></div>
          <div>
            <h1 className={styles.title}>Drug Reference</h1>
            <p className={styles.subtitle}>Instant search for any medicine</p>
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="Search by drug name, class, generic..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Classes Filter */}
        <div className={styles.filterScroll}>
          <button 
            className={`${styles.filterChip} ${selectedClass === 'All' ? styles.filterActive : ''}`}
            onClick={() => setSelectedClass('All')}
          >
            All
          </button>
          {DRUG_CLASSES.slice(0,8).map(c => (
            <button 
              key={c}
              className={`${styles.filterChip} ${selectedClass === c ? styles.filterActive : ''}`}
              onClick={() => setSelectedClass(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className={styles.resultsCount}>
          {results.length} {results.length === 1 ? 'drug' : 'drugs'} found
        </div>

        <div className={styles.list}>
          {results.map(drug => (
            <button key={drug.id} className={styles.drugCard} onClick={() => setSelectedDrug(drug)}>
              <div className={styles.drugCardTop}>
                <h3 className={styles.drugName}>{drug.name}</h3>
                {isSaved(drug.id) && <Bookmark size={16} color="#FBBF24" fill="#FBBF24" />}
              </div>
              <p className={styles.drugGeneric}>{drug.generic}</p>
              <div className={styles.drugTags}>
                <span className={styles.tagPrimary}>{drug.class.split('/')[0]}</span>
                {drug.pregnancyCategory === 'X' && <span className={styles.tagDanger}>Pregnancy X</span>}
              </div>
              <div className={styles.drugYield}>
                <strong>High Yield:</strong> {drug.highYield.split('|')[0]}
              </div>
            </button>
          ))}
          {results.length === 0 && (
            <div className={styles.emptyState}>
              <Search size={40} color="var(--text-muted)" />
              <p>No drugs found matching your search.</p>
            </div>
          )}
        </div>

        <div style={{ height: 'calc(var(--nav-h) + 16px)' }} />
      </div>
      <BottomNav />
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Detailed View Component
// ──────────────────────────────────────────────────────────
function DrugDetailView({ drug, onBack, isSaved, toggleSave }) {
  const navigate = useNavigate();

  const handleAskAI = (lang) => {
    navigate('/ask-ai', { state: { initialQuery: `Explain the drug ${drug.name} in ${lang}, focusing on MOA, indications, and side effects.` } });
  };

  return (
    <div className={styles.page}>
      {/* Detail Header */}
      <div className={styles.detailHeader}>
        <button className={styles.backBtn} onClick={onBack}><ChevronLeft size={24} /></button>
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={toggleSave}>
            <Bookmark size={22} color={isSaved ? '#FBBF24' : 'white'} fill={isSaved ? '#FBBF24' : 'none'} />
          </button>
          <button className={styles.iconBtn}><Share2 size={22} color="white" /></button>
        </div>
      </div>

      <div className={styles.detailContainer}>
        {/* Title Section */}
        <div className={styles.titleSection}>
          <h1 className={styles.detailTitle}>{drug.name}</h1>
          <p className={styles.detailGeneric}>{drug.generic} • {drug.brand}</p>
          <div className={styles.detailTags}>
            <span className={styles.detailTag}>{drug.class}</span>
            <span className={`${styles.detailTag} ${drug.pregnancyCategory.includes('X') || drug.pregnancyCategory.includes('D') ? styles.tagDanger : styles.tagSafe}`}>
              Pregnancy: {drug.pregnancyCategory}
            </span>
          </div>
        </div>

        {/* High Yield Banner */}
        <div className={styles.highYieldBanner}>
          <div className={styles.hyTop}>
            <Brain size={18} color="#FBBF24" />
            <span>High Yield Notes</span>
          </div>
          <p className={styles.hyText}>{drug.highYield}</p>
        </div>

        {/* Content Sections */}
        <div className={styles.contentSections}>
          
          <Section title="Mechanism of Action" icon={<Activity size={20} color="#3B82F6" />}>
            <p>{drug.moa}</p>
          </Section>

          <Section title="Indications" icon={<Check size={20} color="#10B981" />}>
            <ul className={styles.listStyle}>
              {drug.indications.map((ind, i) => <li key={i}>{ind}</li>)}
            </ul>
          </Section>

          <Section title="Contraindications" icon={<ShieldAlert size={20} color="#EF4444" />}>
            <ul className={styles.listStyle}>
              {drug.contraindications.map((ci, i) => <li key={i}>{ci}</li>)}
            </ul>
          </Section>

          <Section title="Side Effects" icon={<HeartPulse size={20} color="#F59E0B" />}>
            <ul className={styles.listStyle}>
              {drug.sideEffects.map((se, i) => <li key={i}>{se}</li>)}
            </ul>
          </Section>

          <div className={styles.grid2}>
            <Section title="Dose" icon={<Pill size={20} color="#8B5CF6" />}>
              <p>{drug.dose}</p>
            </Section>
            <Section title="Route" icon={<Info size={20} color="#06B6D4" />}>
              <p>{drug.route}</p>
            </Section>
          </div>

          <Section title="Drug Interactions" icon={<Activity size={20} color="#EC4899" />}>
            <ul className={styles.listStyle}>
              {drug.interactions.map((ix, i) => <li key={i}>{ix}</li>)}
            </ul>
          </Section>

          <Section title="Important Exam Points" icon={<Brain size={20} color="#6366F1" />}>
            <ul className={styles.examList}>
              {drug.examPoints.map((ep, i) => (
                <li key={i}>
                  <div className={styles.examBullet}></div>
                  {ep}
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* AI Explainer */}
        <div className={styles.aiExplainer}>
          <div className={styles.aiHeader}>
            <Bot size={20} color="#fff" />
            <span>AI Explainer</span>
          </div>
          <p className={styles.aiSub}>Having trouble understanding? Let AI explain it to you in simple terms.</p>
          <div className={styles.aiButtons}>
            <button className="btn btn-ghost" onClick={() => handleAskAI('English')}>English</button>
            <button className="btn btn-ghost" onClick={() => handleAskAI('Hinglish')}>Hinglish</button>
            <button className="btn btn-ghost" onClick={() => handleAskAI('Malayalam')}>Malayalam</button>
          </div>
        </div>

      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        {icon}
        <h3 className={styles.sectionTitle}>{title}</h3>
      </div>
      <div className={styles.sectionBody}>
        {children}
      </div>
    </div>
  );
}
