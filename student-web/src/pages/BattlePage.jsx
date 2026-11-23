import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBattleStore } from '../store/battleStore';
import { Sword, Users, Play, ChevronLeft, Loader, Trophy, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import styles from './BattlePage.module.css';

export default function BattlePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const name = profile?.full_name || user?.email?.split('@')[0] || 'Player';
  
  const { 
    status, roomCode, participants, createRoom, joinRoom, 
    setReady, startGame, submitAnswer, activeQuestion,
    timeLeft, isHost, selectedOptionIndex, revealedResult, 
    leaderboard, disconnect, error 
  } = useBattleStore();

  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  const handleCreate = async () => {
    setIsCreating(true);
    await createRoom({ subjectId: '1', questionCount: 5, difficulty: 'medium' }, user.id, name);
    setIsCreating(false);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (joinCode.length === 6) {
      await joinRoom(joinCode.toUpperCase(), user.id, name);
    }
  };

  if (status === 'live' && activeQuestion) {
    const isAnswered = selectedOptionIndex !== null;
    const isRevealed = revealedResult !== null;

    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.liveHeader}>
            <div className={styles.timerBox}>
              <span className={styles.timer}>{timeLeft}s</span>
            </div>
          </div>

          <div className={styles.questionCard}>
            <h2 className={styles.questionText}>{activeQuestion.question}</h2>
            
            <div className={styles.optionsList}>
              {activeQuestion.options.map((opt, idx) => {
                let optStyle = styles.option;
                
                if (isRevealed) {
                  if (idx === revealedResult.correctIndex) optStyle += ` ${styles.optionCorrect}`;
                  else if (idx === selectedOptionIndex) optStyle += ` ${styles.optionWrong}`;
                  else optStyle += ` ${styles.optionDimmed}`;
                } else if (idx === selectedOptionIndex) {
                  optStyle += ` ${styles.optionSelected}`;
                }

                return (
                  <button 
                    key={idx} 
                    className={optStyle}
                    onClick={() => submitAnswer(idx)}
                    disabled={isAnswered || isRevealed}
                  >
                    <span className={styles.optLetter}>{String.fromCharCode(65 + idx)}</span>
                    <span className={styles.optText}>{opt}</span>
                    {isRevealed && idx === revealedResult.correctIndex && <CheckCircle size={20} color="#10B981" />}
                    {isRevealed && idx === selectedOptionIndex && idx !== revealedResult.correctIndex && <XCircle size={20} color="#EF4444" />}
                  </button>
                );
              })}
            </div>

            {isRevealed && (
              <div className={styles.explanationBox}>
                <p><strong>Explanation:</strong> {revealedResult.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'ended') {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.resultHeader}>
            <Trophy size={48} color="#FBBF24" />
            <h1 className={styles.resultTitle}>Battle Finished!</h1>
          </div>
          
          <div className={styles.leaderboardCard}>
            {leaderboard.map((p, i) => (
              <div key={p.userId} className={styles.lbRow}>
                <span className={styles.lbRank}>#{i + 1}</span>
                <span className={styles.lbName}>{p.name} {p.userId === user.id && '(You)'}</span>
                <span className={styles.lbScore}>{p.score} pts</span>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/home')} style={{ width: '100%', marginTop: 20 }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === 'lobby') {
    const me = participants.find(p => p.userId === user.id);
    const allReady = participants.length > 0 && participants.every(p => p.isReady);

    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.lobbyHeader}>
            <h1 className={styles.lobbyTitle}>Room Code: <span className={styles.roomCode}>{roomCode}</span></h1>
            <p className={styles.lobbySub}>Share this code with your friends to join.</p>
          </div>

          <div className={styles.playersCard}>
            <h3 className={styles.playersTitle}>Players ({participants.length})</h3>
            <div className={styles.playersList}>
              {participants.map(p => (
                <div key={p.userId} className={styles.playerRow}>
                  <div className={styles.playerName}>
                    {p.name} {p.isHost && <span className={styles.hostBadge}>HOST</span>}
                  </div>
                  <div className={`${styles.statusBadge} ${p.isReady ? styles.statusReady : ''}`}>
                    {p.isReady ? 'READY' : 'WAITING'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.lobbyActions}>
            {!me?.isReady ? (
              <button className="btn btn-primary" onClick={() => setReady(true)}>I'm Ready</button>
            ) : (
              <button className="btn" onClick={() => setReady(false)}>Cancel Ready</button>
            )}

            {isHost && (
              <button 
                className="btn btn-primary" 
                onClick={startGame} 
                disabled={!allReady}
                style={{ background: allReady ? '#10B981' : '#94A3B8' }}
              >
                Start Game
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // IDLE status (Home)
  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/home" className={styles.backBtn}>
            <ChevronLeft size={24} />
            <span>Back</span>
          </Link>
          <div className={styles.titleWrap}>
            <Sword size={32} color="#F59E0B" />
            <h1 className={styles.title}>Quiz Battle</h1>
          </div>
          <p className={styles.sub}>Compete in real-time with other medical students.</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.actionCards}>
          <div className={styles.card}>
            <div className={styles.cardIcon} style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <Users size={32} color="#F59E0B" />
            </div>
            <h3>Join a Battle</h3>
            <p>Enter a 6-letter room code to join an existing battle.</p>
            <form onSubmit={handleJoin} className={styles.joinForm}>
              <input 
                type="text" 
                maxLength={6} 
                placeholder="ROOM CODE" 
                className={styles.codeInput}
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
              />
              <button type="submit" className="btn btn-primary" disabled={joinCode.length !== 6}>Join</button>
            </form>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <Play size={32} color="#10B981" />
            </div>
            <h3>Create a Battle</h3>
            <p>Host a new game and invite your friends to compete.</p>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={handleCreate} disabled={isCreating}>
              {isCreating ? <Loader className={styles.spin} /> : 'Create Room'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
