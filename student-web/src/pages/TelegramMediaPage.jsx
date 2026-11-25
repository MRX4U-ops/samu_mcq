import { Link } from 'react-router-dom';
import { ChevronLeft, Film } from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import TelegramMediaSection from '../components/TelegramMediaSection';
import styles from './TelegramMediaPage.module.css';

export default function TelegramMediaPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroTop}>
            <Link to="/home" className={styles.backBtn}>
              <ChevronLeft size={16} />
              <span>Back to Home</span>
            </Link>
          </div>
          <div className={styles.heroTitleRow}>
            <div className={styles.heroIcon}>
              <Film size={28} />
            </div>
            <div>
              <h1 className={styles.heroTitle}>SAMU TIGERS Library</h1>
              <p className={styles.heroSub}>
                Watch lecture videos &amp; read PDF notes directly on the website — streamed live from Telegram.
              </p>
            </div>
          </div>
        </div>

        <TelegramMediaSection initialLimit={30} />
      </main>
      <BottomNav />
    </div>
  );
}
