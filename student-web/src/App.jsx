import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import BattlePage from './pages/BattlePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ExamResultPage from './pages/ExamResultPage';
import AskAIPage from './pages/AskAIPage';
import HelpDeskPage from './pages/HelpDeskPage';
import GuidancePage from './pages/GuidancePage';
import SubjectPage from './pages/SubjectPage';
import QuizPage from './pages/QuizPage';
import ProfilePage from './pages/ProfilePage';
import SubscribePage from './pages/SubscribePage';
import DrugReferencePage from './pages/DrugReferencePage';
import ClinicalCasePage from './pages/ClinicalCasePage';
import RevisionEnginePage from './pages/RevisionEnginePage';

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Navigate to="/login?mode=signup" replace />} />

          {/* Protected */}
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/course/:courseId" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
          <Route path="/subject/:subjectId" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/battle" element={<ProtectedRoute><BattlePage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><ExamResultPage /></ProtectedRoute>} />
          <Route path="/ask-ai" element={<ProtectedRoute><AskAIPage /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><HelpDeskPage /></ProtectedRoute>} />
          <Route path="/guidance" element={<ProtectedRoute><GuidancePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/subscribe" element={<ProtectedRoute><SubscribePage /></ProtectedRoute>} />
          <Route path="/drugs" element={<ProtectedRoute><DrugReferencePage /></ProtectedRoute>} />
          <Route path="/clinical-case" element={<ProtectedRoute><ClinicalCasePage /></ProtectedRoute>} />
          <Route path="/revision" element={<ProtectedRoute><RevisionEnginePage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
