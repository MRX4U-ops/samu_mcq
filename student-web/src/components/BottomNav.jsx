import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Brain, Pill, User } from 'lucide-react';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const location = useLocation();
  const current = location.pathname;

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <NavLink 
          to="/home" 
          className={({ isActive }) => `${styles.navItem} ${isActive || current === '/' ? styles.active : ''}`}
        >
          <div className={styles.iconWrap}>
            <Home size={22} />
          </div>
          <span className={styles.label}>Home</span>
        </NavLink>

        <NavLink 
          to="/clinical-case" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <div className={styles.iconWrap}>
            <Search size={22} />
          </div>
          <span className={styles.label}>Case</span>
        </NavLink>

        <NavLink 
          to="/revision" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <div className={styles.iconWrap}>
            <div className={styles.actionButton}>
              <Brain size={24} color="#fff" />
            </div>
          </div>
          <span className={styles.label} style={{ marginTop: 24 }}>Revise</span>
        </NavLink>

        <NavLink 
          to="/drugs" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <div className={styles.iconWrap}>
            <Pill size={22} />
          </div>
          <span className={styles.label}>Drugs</span>
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <div className={styles.iconWrap}>
            <User size={22} />
          </div>
          <span className={styles.label}>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
