import React, { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// ── Lazy-loaded pages (each becomes its own chunk → only loads when needed) ──
const LandingPage       = lazy(() => import('./pages/LandingPage'));
const LoginPage         = lazy(() => import('./pages/LoginPage'));
const HomePage          = lazy(() => import('./pages/HomePage'));
const CoursePage        = lazy(() => import('./pages/CoursePage'));
const BattlePage        = lazy(() => import('./pages/BattlePage'));
const LeaderboardPage   = lazy(() => import('./pages/LeaderboardPage'));
const ExamResultPage    = lazy(() => import('./pages/ExamResultPage'));
const AskAIPage         = lazy(() => import('./pages/AskAIPage'));
const HelpDeskPage      = lazy(() => import('./pages/HelpDeskPage'));
const GuidancePage      = lazy(() => import('./pages/GuidancePage'));
const SubjectPage       = lazy(() => import('./pages/SubjectPage'));
const QuizPage          = lazy(() => import('./pages/QuizPage'));
const ProfilePage       = lazy(() => import('./pages/ProfilePage'));
const SubscribePage     = lazy(() => import('./pages/SubscribePage'));
const DrugReferencePage = lazy(() => import('./pages/DrugReferencePage'));
const ClinicalCasePage  = lazy(() => import('./pages/ClinicalCasePage'));
const RevisionEnginePage= lazy(() => import('./pages/RevisionEnginePage'));
const TelegramMediaPage = lazy(() => import('./pages/TelegramMediaPage'));
const AdminPage         = lazy(() => import('./pages/AdminPage'));

// ── Prefetch all page chunks in the background after first render ─────────────
// This silently downloads all chunks while the user reads the landing page,
// so every tab click & login feel instant (chunk already in browser cache).
function usePrefetchAllPages() {
  useEffect(() => {
    const prefetch = () => {
      import('./pages/LoginPage');
      import('./pages/HomePage');
      import('./pages/CoursePage');
      import('./pages/SubjectPage');
      import('./pages/QuizPage');
      import('./pages/BattlePage');
      import('./pages/LeaderboardPage');
      import('./pages/AskAIPage');
      import('./pages/GuidancePage');
      import('./pages/ProfilePage');
      import('./pages/SubscribePage');
      import('./pages/DrugReferencePage');
      import('./pages/ClinicalCasePage');
      import('./pages/HelpDeskPage');
      import('./pages/ExamResultPage');
      import('./pages/RevisionEnginePage');
    };
    // Use requestIdleCallback so prefetch never blocks main thread
    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetch, { timeout: 3000 });
    } else {
      setTimeout(prefetch, 2000);
    }
  }, []);
}

// Lightweight spinner shown while a lazy chunk loads
const PageLoader = () => (
  <div style={{
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: '80vh'
  }}>
    <div style={{
      width: 36, height: 36,
      border: '3px solid #E0E7FF',
      borderTopColor: '#4F46E5',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite'
    }} />
  </div>
);

export default function App() {
  usePrefetchAllPages();
  return (
    <AuthProvider>
      <HashRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"         element={<LandingPage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<Navigate to="/login?mode=signup" replace />} />

            {/* Protected */}
            <Route path="/home"             element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/course/:courseId" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
            <Route path="/subject/:subjectId" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
            <Route path="/quiz"             element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
            <Route path="/battle"           element={<ProtectedRoute><BattlePage /></ProtectedRoute>} />
            <Route path="/leaderboard"      element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
            <Route path="/results"          element={<ProtectedRoute><ExamResultPage /></ProtectedRoute>} />
            <Route path="/ask-ai"           element={<ProtectedRoute><AskAIPage /></ProtectedRoute>} />
            <Route path="/help"             element={<ProtectedRoute><HelpDeskPage /></ProtectedRoute>} />
            <Route path="/guidance"         element={<ProtectedRoute><GuidancePage /></ProtectedRoute>} />
            <Route path="/profile"          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/subscribe"        element={<ProtectedRoute><SubscribePage /></ProtectedRoute>} />
            <Route path="/drugs"            element={<ProtectedRoute><DrugReferencePage /></ProtectedRoute>} />
            <Route path="/clinical-case"    element={<ProtectedRoute><ClinicalCasePage /></ProtectedRoute>} />
            <Route path="/revision"         element={<ProtectedRoute><RevisionEnginePage /></ProtectedRoute>} />
            <Route path="/telegram-media"   element={<ProtectedRoute><TelegramMediaPage /></ProtectedRoute>} />
            <Route path="/admin"            element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </AuthProvider>
  );
}
