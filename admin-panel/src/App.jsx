import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Payments from './pages/Payments';
import Subscriptions from './pages/Subscriptions';
import Coupons from './pages/Coupons';
import Courses from './pages/Courses';
import McqEditor from './pages/McqEditor';
import BulkUpload from './pages/BulkUpload';
import SupportTickets from './pages/SupportTickets';
import SubAdmins from './pages/SubAdmins';
import AppSettings from './pages/AppSettings';
import LoginPage from './pages/LoginPage';
import ResetPassword from './pages/ResetPassword';
import useAuthStore from './store/authStore';

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore(state => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="payments" element={<Payments />} />
        <Route path="academic" element={<Courses />} />
        <Route path="mcq-editor" element={<McqEditor />} />
        <Route path="bulk-import" element={<BulkUpload />} />
        <Route path="support" element={<SupportTickets />} />
        <Route path="sub-admins" element={<SubAdmins />} />
        <Route path="settings" element={<AppSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
