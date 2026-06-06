import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Brain, Pill, User } from 'lucide-react';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const location = useLocation();
  const current = location.pathname;

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <NavLink 
          to="/home" 
          className={({ isActive }) => `${styles.item} ${isActive || current === '/' ? styles.active : ''}`}
        >
          {({ isActive }) => (
            <>
              {(isActive || current === '/') && <div className={styles.activeDot} />}
              <div className={isActive || current === '/' ? styles.activeIconWrap : ''}>
                <Home size={22} className={styles.icon} />
              </div>
              <span className={styles.label}>Home</span>
            </>
          )}
        </NavLink>

        <NavLink 
          to="/clinical-case" 
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          {({ isActive }) => (
            <>
              {isActive && <div className={styles.activeDot} />}
              <div className={isActive ? styles.activeIconWrap : ''}>
                <Search size={22} className={styles.icon} />
              </div>
              <span className={styles.label}>Case</span>
            </>
          )}
        </NavLink>

        <NavLink 
          to="/revision" 
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          {({ isActive }) => (
            <>
              {isActive && <div className={styles.activeDot} />}
              <div className={isActive ? styles.activeIconWrap : ''}>
                <Brain size={22} className={styles.icon} />
              </div>
              <span className={styles.label}>Revise</span>
            </>
          )}
        </NavLink>

        <NavLink 
          to="/drugs" 
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          {({ isActive }) => (
            <>
              {isActive && <div className={styles.activeDot} />}
              <div className={isActive ? styles.activeIconWrap : ''}>
                <Pill size={22} className={styles.icon} />
              </div>
              <span className={styles.label}>Drugs</span>
            </>
          )}
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          {({ isActive }) => (
            <>
              {isActive && <div className={styles.activeDot} />}
              <div className={isActive ? styles.activeIconWrap : ''}>
                <User size={22} className={styles.icon} />
              </div>
              <span className={styles.label}>Profile</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
