import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Send, ChevronLeft, Ticket, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import styles from './HelpDeskPage.module.css';

export default function HelpDeskPage() {
  const { user, profile } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { error: dbError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user?.id,
          subject: subject,
          description: message,
          status: 'open'
        });

      if (dbError) throw dbError;

      setSuccess(true);
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Ticket error:', err);
      setError('Failed to submit ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            <HelpCircle size={32} color="#F43F5E" />
            <h1 className={styles.title}>Help Desk</h1>
          </div>
          <p className={styles.sub}>Need assistance? Send us a message and our support team will help you out.</p>
        </div>

        <div className={styles.card}>
          {success ? (
            <div className={styles.successView}>
              <CheckCircle size={60} color="#10B981" />
              <h2 className={styles.successTitle}>Ticket Submitted!</h2>
              <p className={styles.successSub}>
                We've received your request and will get back to you soon.
              </p>
              <button className="btn btn-primary" onClick={() => setSuccess(false)}>
                Submit Another Ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formHeader}>
                <Ticket size={20} color="var(--text-secondary)" />
                <span>Create New Ticket</span>
              </div>

              {error && <div className={styles.errorBox}>{error}</div>}

              <div className={styles.inputGroup}>
                <label className={styles.label}>Subject</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="E.g. Problem with subscription"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Message</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Describe your issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14 }} disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Ticket'}
                {!isLoading && <Send size={16} style={{ marginLeft: 8 }} />}
              </button>
              
              <div className={styles.contactFooter}>
                <p>Or contact us directly on Telegram:</p>
                <a href="https://t.me/mrx4u" target="_blank" rel="noopener noreferrer" className={styles.telegramLink}>
                  @mrx4u
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
