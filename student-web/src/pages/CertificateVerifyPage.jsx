import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Award, Calendar, BookOpen, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import styles from './CertificateVerifyPage.module.css';

export default function CertificateVerifyPage() {
  const { certId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cert, setCert] = useState(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      setLoading(true);
      setError(null);
      try {
        // Query the verification endpoint using native fetch
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiBaseUrl}/certificates/verify/${certId}`);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Certificate not found or invalid.');
        }
        const data = await response.json();
        setCert(data);
      } catch (err) {
        console.error('Error verifying certificate:', err);
        setError(err.message || 'Certificate not found or invalid.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loadingState}>
            <Loader2 className={styles.spinner} size={48} color="var(--primary)" />
            <h2 className={styles.statusTitle}>Verifying Certificate...</h2>
            <p className={styles.statusSub}>Retrieving records from Academic Board ledger</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.errorState}>
            <XCircle size={64} color="#EF4444" className={styles.iconBounce} />
            <h2 className={styles.statusTitle}>Verification Failed</h2>
            <p className={styles.errorText}>{error || 'The certificate ID provided could not be verified.'}</p>
            <p className={styles.statusSub}>This credential may be invalid or has been revoked.</p>
            
            <div className={styles.divider} />
            
            <Link to="/" className={styles.homeBtn}>
              <ArrowLeft size={16} />
              <span>Back to Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isRevoked = cert.revoked;
  const isPassed = cert.score >= 98;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Verification Status Header */}
        <div className={`${styles.statusHeader} ${isRevoked ? styles.headerRevoked : styles.headerValid}`}>
          {isRevoked ? (
            <>
              <XCircle size={32} color="#FFFFFF" />
              <div>
                <h2 className={styles.verifyBadgeTitle}>REVOKED CREDENTIAL</h2>
                <p className={styles.verifyBadgeSub}>This certificate has been suspended by the admin</p>
              </div>
            </>
          ) : (
            <>
              <ShieldCheck size={32} color="#FFFFFF" className={styles.pulse} />
              <div>
                <h2 className={styles.verifyBadgeTitle}>OFFICIALLY VERIFIED</h2>
                <p className={styles.verifyBadgeSub}>Valid SAMU Academic Credential</p>
              </div>
            </>
          )}
        </div>

        {/* Certificate Details */}
        <div className={styles.content}>
          <div className={styles.sealWrapper}>
            {/* Background Medical Cross Seal Watermark */}
            <svg className={styles.sealWatermark} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="1" d="M19 10.5h-5.5V5c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5v5.5H5c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5h5.5V19c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5v-5.5H19c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5z"/>
            </svg>
          </div>

          <div className={styles.headerBlock}>
            <span className={styles.samuLabel}>SAMU MCQs</span>
            <h1 className={styles.certTitle}>Certificate of Excellence</h1>
            <p className={styles.certId}>ID: {cert.certificate_id}</p>
          </div>

          <div className={styles.metaGrid}>
            <div className={styles.metaRow}>
              <Award className={styles.metaIcon} size={20} color="var(--warning)" />
              <div className={styles.metaInfo}>
                <span className={styles.metaLabel}>Awardee Name</span>
                <span className={styles.metaValue}>{cert.student_name}</span>
              </div>
            </div>

            <div className={styles.metaRow}>
              <BookOpen className={styles.metaIcon} size={20} color="var(--primary)" />
              <div className={styles.metaInfo}>
                <span className={styles.metaLabel}>Subject & Distinction</span>
                <span className={styles.metaValue}>
                  {cert.subject_name} · <span className={styles.levelBadge}>{cert.achievement_level}</span>
                </span>
              </div>
            </div>

            <div className={styles.metaRow}>
              <Award className={styles.metaIcon} size={20} color="var(--accent-green)" />
              <div className={styles.metaInfo}>
                <span className={styles.metaLabel}>Score Achieved</span>
                <span className={styles.scoreVal}>{Number(cert.score).toFixed(1)}%</span>
              </div>
            </div>

            <div className={styles.metaRow}>
              <Calendar className={styles.metaIcon} size={20} color="var(--text-muted)" />
              <div className={styles.metaInfo}>
                <span className={styles.metaLabel}>Completion Date</span>
                <span className={styles.metaValue}>{cert.completion_date}</span>
              </div>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.issuerBlock}>
            <div className={styles.issuerDetails}>
              <span className={styles.issuerLabel}>Authority Ledger</span>
              <span className={styles.issuerName}>SAMU Academic Excellence Board</span>
            </div>
            
            {!isRevoked && (
              <div className={styles.badgeSeal}>
                <div className={styles.badgeSealInner}>
                  <span>SAMU</span>
                  <span className={styles.badgeSealYear}>2026</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <Link to="/" className={styles.primaryHomeBtn}>
              <ArrowLeft size={16} />
              <span>Back to Portal Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
