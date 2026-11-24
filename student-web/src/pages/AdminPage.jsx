import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowLeft, ExternalLink } from 'lucide-react';

export default function AdminPage() {
  const { user, profile, isSuperAdmin } = useAuth();
  const isSuper = isSuperAdmin || user?.email?.toLowerCase() === 'mohd6396889713@gmail.com' || profile?.role === 'admin';

  if (!isSuper) {
    return <Navigate to="/home" replace />;
  }

  const getAdminPath = () => {
    if (typeof window === 'undefined') return './admin/index.html';
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5174';
    }
    const origin = window.location.origin;
    const base = window.location.pathname.startsWith('/samu_mcq') ? '/samu_mcq' : '';
    return `${origin}${base}/admin/index.html`;
  };

  const adminUrl = getAdminPath();

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0F172A', overflow: 'hidden' }}>
      {/* Top Bar with quick navigation */}
      <div style={{
        height: 48,
        background: '#1E293B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        color: '#fff',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            to="/profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#94A3B8',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
              padding: '5px 12px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.06)'
            }}
          >
            <ArrowLeft size={14} /> Back to Student Mode
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: '#FBBF24' }}>
            <Shield size={16} /> Super Admin Control Center
          </div>
        </div>

        <a
          href={adminUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#38BDF8',
            textDecoration: 'none',
            fontSize: 12,
            fontWeight: 700
          }}
          title="Open in new full tab"
        >
          Open in New Tab <ExternalLink size={13} />
        </a>
      </div>

      {/* Embedded Admin Panel */}
      <iframe
        src={adminUrl}
        title="SAMU MCQs Admin Control Center"
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          background: '#0F172A'
        }}
      />
    </div>
  );
}
