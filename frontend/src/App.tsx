import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { JobListPage } from './pages/JobListPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Candidate Pages
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { MyApplicationsPage } from './pages/candidate/MyApplicationsPage';
import { CandidateProfilePage } from './pages/candidate/CandidateProfilePage';

// Recruiter Pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { MyJobsPage } from './pages/recruiter/MyJobsPage';
import { CreateEditJobPage } from './pages/recruiter/CreateEditJobPage';
import { ApplicantsPage } from './pages/recruiter/ApplicantsPage';
import { CandidateSearchPage } from './pages/recruiter/CandidateSearchPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminJobsPage } from './pages/admin/AdminJobsPage';

import { ApiDocsPage } from './pages/ApiDocsPage';

// Route Guards
const CandidateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isCandidate } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs text-slate-400">Loading...</div>;
  if (!user || !isCandidate) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RecruiterRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isRecruiter, isAdmin } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs text-slate-400">Loading...</div>;
  if (!user || (!isRecruiter && !isAdmin)) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs text-slate-400">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/jobs" element={<JobListPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/docs" element={<ApiDocsPage />} />

              {/* Candidate Protected Routes */}
              <Route
                path="/candidate/dashboard"
                element={
                  <CandidateRoute>
                    <CandidateDashboard />
                  </CandidateRoute>
                }
              />
              <Route
                path="/candidate/applications"
                element={
                  <CandidateRoute>
                    <MyApplicationsPage />
                  </CandidateRoute>
                }
              />
              <Route
                path="/candidate/profile"
                element={
                  <CandidateRoute>
                    <CandidateProfilePage />
                  </CandidateRoute>
                }
              />

              {/* Recruiter Protected Routes */}
              <Route
                path="/recruiter/dashboard"
                element={
                  <RecruiterRoute>
                    <RecruiterDashboard />
                  </RecruiterRoute>
                }
              />
              <Route
                path="/recruiter/jobs"
                element={
                  <RecruiterRoute>
                    <MyJobsPage />
                  </RecruiterRoute>
                }
              />
              <Route
                path="/recruiter/jobs/new"
                element={
                  <RecruiterRoute>
                    <CreateEditJobPage />
                  </RecruiterRoute>
                }
              />
              <Route
                path="/recruiter/jobs/edit/:id"
                element={
                  <RecruiterRoute>
                    <CreateEditJobPage />
                  </RecruiterRoute>
                }
              />
              <Route
                path="/recruiter/applicants"
                element={
                  <RecruiterRoute>
                    <ApplicantsPage />
                  </RecruiterRoute>
                }
              />
              <Route
                path="/recruiter/candidates"
                element={
                  <RecruiterRoute>
                    <CandidateSearchPage />
                  </RecruiterRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsersPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/jobs"
                element={
                  <AdminRoute>
                    <AdminJobsPage />
                  </AdminRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
