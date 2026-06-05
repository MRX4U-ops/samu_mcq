import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Bell } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, profile } = useAuth();
  const initial = profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to={user ? '/home' : '/'} className={styles.brand}>
          <div className={styles.logo}>
            <BookOpen size={18} color="#fff" />
          </div>
          <span className={styles.brandName}>SAMU <span className={styles.brandAccent}>MCQs</span></span>
        </Link>

        <div className={styles.actions}>
          {user ? (
            <>
              <button className={styles.bellBtn} title="Notifications">
                <Bell size={18} />
                <span className={styles.bellDot} />
              </button>
              <Link to="/profile" className={styles.avatarBtn}>
                {initial}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
