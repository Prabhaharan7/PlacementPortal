import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/Layout/DashboardLayout';
import AdminLayout from './components/Layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AptitudeTestPage from './pages/AptitudeTestPage';
import AptitudePage from './pages/AptitudePage';
import AptitudeAnalyticsPage from './pages/AptitudeAnalyticsPage';
import CodingPage from './pages/CodingPage';
import ResumePage from './pages/ResumePage';
import CompaniesPage from './pages/CompaniesPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminStudentMonitorPage from './pages/AdminStudentMonitorPage';
import AdminStudentDetailPage from './pages/AdminStudentDetailPage';
import AdminAptitudeMonitorPage from './pages/AdminAptitudeMonitorPage';
import AdminCodingMonitorPage from './pages/AdminCodingMonitorPage';
import AdminCompanyMonitorPage from './pages/AdminCompanyMonitorPage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';
import AdminPlacementAnalyticsPage from './pages/AdminPlacementAnalyticsPage';
import StudyMaterialsPage from './pages/StudyMaterialsPage';
import AdminStudyMaterialsPage from './pages/AdminStudyMaterialsPage';
import CodeEditorPage from './pages/CodeEditorPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

import SignupPage from './pages/SignupPage';

/* ── Helpers ── */
const isAdminUser = (user) => user?.is_staff || user?.role === 'admin';

/* ── Must be logged in ── */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/* ── Must be admin — if student, kick to /dashboard ── */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdminUser(user)) return <Navigate to="/dashboard" replace />;
  return children;
};

/* ── Must be student — if admin, kick to admin dashboard ── */
const StudentRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdminUser(user)) return <Navigate to="/admin/dashboard" replace />;
  return children;
};

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="students" element={<AdminStudentMonitorPage />} />
            <Route path="students/:id" element={<AdminStudentDetailPage />} />
            <Route path="aptitude" element={<AdminAptitudeMonitorPage />} />
            <Route path="coding" element={<AdminCodingMonitorPage />} />
            <Route path="companies" element={<AdminCompanyMonitorPage />} />
            <Route path="materials" element={<AdminStudyMaterialsPage />} />
            <Route path="analytics" element={<AdminPlacementAnalyticsPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/"
            element={
              <StudentRoute>
                <DashboardLayout />
              </StudentRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="aptitude" element={<AptitudePage />} />
            <Route path="aptitude/test/:id" element={<AptitudeTestPage />} />
            <Route path="aptitude/analytics" element={<AptitudeAnalyticsPage />} />
            <Route path="coding" element={<CodingPage />} />
            <Route path="coding/problem/:id" element={<CodeEditorPage />} />
            <Route path="materials" element={<StudyMaterialsPage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
