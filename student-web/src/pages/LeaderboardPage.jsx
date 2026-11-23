import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Trophy, ChevronLeft, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import styles from './LeaderboardPage.module.css';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('daily');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const table = period === 'global' ? 'leaderboard_monthly' : `leaderboard_${period}`;
        
        const { data, error } = await supabase
          .from(table)
          .select(`
            points,
            user_id,
            profiles (
              full_name
            )
          `)
          .order('points', { ascending: false })
          .limit(50);

        if (error) throw error;

        const mappedData = (data || []).map(item => ({
          user_id: item.user_id,
          name: item.profiles?.full_name || 'Anonymous',
          points: item.points
        }));

        setLeaderboard(mappedData);
      } catch (err) {
        console.error('Error loading leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [period]);

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/home" className={styles.backBtn}>
            <ChevronLeft size={24} />
            <span>Back</span>
          </Link>
          <h1 className={styles.title}>Global Rankings</h1>
          <p className={styles.sub}>See how you stack up against other medical students.</p>
        </div>

        <div className={styles.tabs}>
          {['daily', 'weekly', 'monthly', 'global'].map(p => (
            <button
              key={p}
              className={`${styles.tab} ${period === p ? styles.activeTab : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.boardCard}>
          <div className={styles.boardHeader}>
            <Award size={20} color="#10B981" />
            <span>TOP PERFORMERS</span>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading rankings...</div>
          ) : leaderboard.length === 0 ? (
            <div className={styles.empty}>
              <Trophy size={48} color="#94A3B8" />
              <p>No entries yet for this period.</p>
            </div>
          ) : (
            <div className={styles.list}>
              {leaderboard.map((item, index) => {
                const isTop3 = index < 3;
                const isMe = item.user_id === user?.id;
                return (
                  <div key={item.user_id} className={`${styles.row} ${isMe ? styles.myRow : ''}`}>
                    <div className={`${styles.rankBadge} ${isTop3 ? styles[`top${index + 1}`] : ''}`}>
                      {index + 1}
                    </div>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>
                        {item.name} {isMe && <span className={styles.youBadge}>YOU</span>}
                      </div>
                    </div>
                    <div className={styles.score}>{item.points} pts</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
