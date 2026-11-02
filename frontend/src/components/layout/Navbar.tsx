import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  UserCheck,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  PlusCircle,
  Search,
  Mail,
  Sun,
  Moon,
} from 'lucide-react';
import { OutboxModal } from '../common/OutboxModal';

export const Navbar: React.FC = () => {
  const { user, logout, login, isCandidate, isRecruiter, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showOutbox, setShowOutbox] = useState(false);
  const [dark, setDark] = useState(false);

  const toggleDarkMode = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleQuickDemoLogin = async (role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN') => {
    let email = 'candidate@example.com';
    if (role === 'RECRUITER') email = 'hr@markytics.com';
    if (role === 'ADMIN') email = 'admin@markytics.com';

    try {
      await login(email, 'Demo@1234');
      if (role === 'CANDIDATE') navigate('/candidate/dashboard');
      else if (role === 'RECRUITER') navigate('/recruiter/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
    } catch (_err) {
      // ignore
    }
  };

  return (
    <>
      {/* Top Demo Bar for Testing & Role Switching */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-mono truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Markytics Intern Portal</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 hidden md:inline">Quick Demo Login:</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleQuickDemoLogin('CANDIDATE')}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              isCandidate ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Candidate Demo
          </button>
          <button
            onClick={() => handleQuickDemoLogin('RECRUITER')}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              isRecruiter ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Recruiter Demo
          </button>
          <button
            onClick={() => handleQuickDemoLogin('ADMIN')}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              isAdmin ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Admin Demo
          </button>

          {(isRecruiter || isAdmin) && (
            <button
              onClick={() => setShowOutbox(true)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1 transition-colors ml-2"
              title="Inspect local email notification outbox"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Email Outbox</span>
            </button>
          )}

          <button
            onClick={toggleDarkMode}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors ml-1"
            title="Toggle theme"
          >
            {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-lg">
              M
            </div>
            <span>Markytics<span className="text-indigo-600 dark:text-indigo-400">Careers</span></span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link
              to="/jobs"
              className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 ${
                location.pathname === '/jobs' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Browse Jobs
            </Link>

            {isCandidate && (
              <>
                <Link
                  to="/candidate/dashboard"
                  className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 ${
                    location.pathname === '/candidate/dashboard' ? 'text-indigo-600 font-semibold' : ''
                  }`}
                >
                  Candidate Dashboard
                </Link>
                <Link
                  to="/candidate/applications"
                  className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 ${
                    location.pathname === '/candidate/applications' ? 'text-indigo-600 font-semibold' : ''
                  }`}
                >
                  My Applications
                </Link>
                <Link
                  to="/candidate/profile"
                  className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 ${
                    location.pathname === '/candidate/profile' ? 'text-indigo-600 font-semibold' : ''
                  }`}
                >
                  My Profile
                </Link>
              </>
            )}

            {isRecruiter && (
              <>
                <Link
                  to="/recruiter/dashboard"
                  className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 ${
                    location.pathname === '/recruiter/dashboard' ? 'text-indigo-600 font-semibold' : ''
                  }`}
                >
                  Recruiter Dashboard
                </Link>
                <Link
                  to="/recruiter/jobs"
                  className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 ${
                    location.pathname === '/recruiter/jobs' ? 'text-indigo-600 font-semibold' : ''
                  }`}
                >
                  My Job Listings
                </Link>
                <Link
                  to="/recruiter/candidates"
                  className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 ${
                    location.pathname === '/recruiter/candidates' ? 'text-indigo-600 font-semibold' : ''
                  }`}
                >
                  Talent Search
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 ${
                    location.pathname === '/admin/dashboard' ? 'text-indigo-600 font-semibold' : ''
                  }`}
                >
                  Admin Overview
                </Link>
                <Link
                  to="/admin/users"
                  className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 ${
                    location.pathname === '/admin/users' ? 'text-indigo-600 font-semibold' : ''
                  }`}
                >
                  Users
                </Link>
                <Link
                  to="/admin/jobs"
                  className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 ${
                    location.pathname === '/admin/jobs' ? 'text-indigo-600 font-semibold' : ''
                  }`}
                >
                  Job Moderation
                </Link>
              </>
            )}

            <Link
              to="/docs"
              className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 ${
                location.pathname === '/docs' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              API Docs
            </Link>
          </nav>

          {/* Zone 3: Primary Action & Profile Account */}
          <div className="flex items-center gap-3 shrink-0">
            {isRecruiter && (
              <Link
                to="/recruiter/jobs/new"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0 shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post a Job</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Outbox Modal Inspector */}
      {showOutbox && <OutboxModal onClose={() => setShowOutbox(false)} />}
    </>
  );
};
