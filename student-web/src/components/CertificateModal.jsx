import { X, Download, Share2, Copy, Send, Check } from 'lucide-react';
import { useState } from 'react';
import styles from './CertificateModal.module.css';

export default function CertificateModal({ cert, onClose }) {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  if (!cert) return null;

  const verificationUrl = `https://mrx4u-ops.github.io/samu_mcq/#/verify/${cert.certificate_id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verificationUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `🏆 I scored ${Number(cert.score).toFixed(1)}% in ${cert.subject_name} on SAMU MCQs! Verify my certificate here: ${verificationUrl}`;

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(verificationUrl)}&text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verificationUrl)}`,
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        
        {/* Modal Header Actions (Hidden in Print) */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Your Academic Certificate</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* The Printable Certificate Container */}
        <div className={styles.certPaperWrapper}>
          <div id="samu-academic-certificate" className={styles.certPaper}>
            
            {/* Border Ornament */}
            <div className={styles.outerBorder}>
              <div className={styles.innerBorder}>
                
                {/* Background Watermark Marks */}
                <div className={styles.watermarkCross}>✚</div>
                <div className={styles.watermarkCrossLeft}>✚</div>

                {/* Stethoscope Watermark Backdrop */}
                <svg className={styles.watermarkSteth} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="0.5" d="M12 2a4 4 0 0 0-4 4v2.5a5.5 5.5 0 0 0 11 0V6a4 4 0 0 0-4-4zm-2 4a2 2 0 1 1 4 0v2.5c0 .6-.1 1.1-.4 1.5M7 14.5a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2a4 4 0 0 1-8 0v-2zM12 18.5v3.5m-3 0h6"/>
                </svg>

                <div className={styles.certHeader}>
                  <div className={styles.universityLogo}>SAMU</div>
                  <div className={styles.universitySub}>Smart App for Medical University</div>
                  <div className={styles.excellenceBanner}>CERTIFICATE OF EXCELLENCE</div>
                </div>

                <div className={styles.certBody}>
                  <p className={styles.awardStatement}>This certificate is proudly awarded to</p>
                  <h2 className={styles.studentName}>{cert.student_name}</h2>
                  <p className={styles.awardDesc}>
                    for demonstrating exceptional academic performance by achieving
                  </p>
                  <div className={styles.scoreHighlight}>
                    <span className={styles.scoreNumber}>{Number(cert.score).toFixed(1)}%</span>
                  </div>
                  <p className={styles.awardDesc}>
                    in the coursework exam of <strong className={styles.subjectHighlight}>{cert.subject_name}</strong> completed on <span className={styles.dateVal}>{cert.completion_date}</span>.
                  </p>
                  <p className={styles.appreciationText}>
                    Your dedication, knowledge and commitment to excellence are highly appreciated.
                  </p>
                </div>

                <div className={styles.certFooter}>
                  {/* Signature Section */}
                  <div className={styles.footerCol}>
                    <div className={styles.signatureWrap}>
                      <span className={styles.signatureScript}>Academic Excellence Board</span>
                      <div className={styles.sigLine} />
                    </div>
                    <span className={styles.footerLabel}>Academic Board, SAMU</span>
                  </div>

                  {/* Digital Seal */}
                  <div className={styles.sealCol}>
                    <div className={styles.officialSeal}>
                      <div className={styles.sealRibbonLeft}></div>
                      <div className={styles.sealRibbonRight}></div>
                      <div className={styles.sealBody}>
                        <div className={styles.sealBodyInner}>
                          <span>SAMU</span>
                          <span className={styles.sealDot}>•</span>
                          <span>SSMU</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Verification Code */}
                  <div className={styles.qrCol}>
                    <img className={styles.qrCodeImage} src={qrCodeUrl} alt="Verification QR Code" />
                    <span className={styles.certIdText}>{cert.certificate_id}</span>
                    <span className={styles.verifyPrompt}>Scan to verify</span>
                  </div>
                </div>

                {/* Level Tag Ribbon */}
                <div className={styles.levelTag}>
                  {cert.achievement_level === 'Platinum Scholar' ? '🥇 Platinum Scholar' : 
                   cert.achievement_level === 'Gold Excellence' ? '⭐ Gold Excellence' : '🏅 Academic Distinction'}
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Modal Controls (Hidden in Print) */}
        <div className={styles.modalActions}>
          <button className={styles.actionBtn} onClick={handlePrint}>
            <Download size={18} />
            <span>Download PDF</span>
          </button>

          <button className={styles.actionBtn} onClick={() => setShareOpen(!shareOpen)}>
            <Share2 size={18} />
            <span>Share Certificate</span>
          </button>

          <button className={styles.actionBtn} onClick={handleCopy}>
            {copied ? <Check size={18} color="#10B981" /> : <Copy size={18} />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Social Share Drawer (Hidden in Print) */}
        {shareOpen && (
          <div className={styles.shareDrawer}>
            <span className={styles.shareTitle}>Post on Social Media</span>
            <div className={styles.shareGrid}>
              <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" className={styles.shareOption}>
                <div className={`${styles.shareIconWrap} ${styles.waBg}`}>
                  <Send size={18} color="#FFFFFF" />
                </div>
                <span>WhatsApp</span>
              </a>
              <a href={shareLinks.telegram} target="_blank" rel="noreferrer" className={styles.shareOption}>
                <div className={`${styles.shareIconWrap} ${styles.tgBg}`}>
                  <Send size={18} color="#FFFFFF" />
                </div>
                <span>Telegram</span>
              </a>
              <a href={shareLinks.facebook} target="_blank" rel="noreferrer" className={styles.shareOption}>
                <div className={`${styles.shareIconWrap} ${styles.fbBg}`}>
                  <Send size={18} color="#FFFFFF" />
                </div>
                <span>Facebook</span>
              </a>
            </div>
            <div className={styles.socialCardPreview}>
              <span className={styles.previewLabel}>Post Text Preview</span>
              <p className={styles.previewText}>{shareText}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
