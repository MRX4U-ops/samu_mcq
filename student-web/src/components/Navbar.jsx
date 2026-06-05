import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const initial = profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to={user ? '/home' : '/'} className={styles.brand}>
          <div className={styles.logo}>
            <BookOpen size={20} color="#fff" />
          </div>
          <span className={styles.brandName}>SAMU MCQs</span>
        </Link>

        <div className={styles.actions}>
          {user ? (
            <>
              <div className={styles.avatar}>{initial}</div>
              <button className="btn btn-ghost" onClick={handleSignOut} style={{ padding: '8px 14px', fontSize: 13 }}>
                <LogOut size={15} />
                <span className="hide-mobile">Sign Out</span>
              </button>
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
