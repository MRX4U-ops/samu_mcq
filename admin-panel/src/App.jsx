import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Payments from './pages/Payments';
import Subscriptions from './pages/Subscriptions';
import SupportTickets from './pages/SupportTickets';
import TicketDetail from './pages/TicketDetail';
import Results from './pages/Results';
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
        <Route path="payments" element={<Payments />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="support" element={<SupportTickets />} />
        <Route path="support/:id" element={<TicketDetail />} />
        <Route path="analytics" element={<Dashboard />} /> {/* Analytics reuse dashboard for now */}
        <Route path="results" element={<Results />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
