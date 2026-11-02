import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { AdminMetrics } from '../../types';
import { Users, Briefcase, FileCheck, CheckCircle2, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { OutboxModal } from '../../components/common/OutboxModal';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOutboxModal, setShowOutboxModal] = useState(false);

  useEffect(() => {
    const fetchAdminMetrics = async () => {
      try {
        const res = await api.get('/dashboards/admin/');
        setMetrics(res.data);
      } catch (_err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchAdminMetrics();
  }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto p-12 text-center text-xs text-slate-400">Loading platform-wide admin metrics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Administrator Platform Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            System-wide hiring statistics, user governance, job moderation, and transactional email logs.
          </p>
        </div>

        <button
          onClick={() => setShowOutboxModal(true)}
          className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 self-start"
        >
          <Mail className="w-4 h-4 text-indigo-400" />
          <span>Inspect Email Outbox Logs ({metrics?.outbox_count || 0})</span>
        </button>
      </div>

      {/* Explicit Metric Definitions Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Users</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
            {metrics?.total_users || 0}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {metrics?.users_by_role.CANDIDATE} Cand &middot; {metrics?.users_by_role.RECRUITER} Rec
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Jobs Posted</span>
          <div className="text-2xl font-black text-indigo-600 font-mono tabular-nums">
            {metrics?.total_jobs_posted || 0}
          </div>
          <span className="text-[10px] text-slate-500">Published &ge; 1 time</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Currently Open</span>
          <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums">
            {metrics?.open_jobs_count || 0}
          </div>
          <span className="text-[10px] text-slate-500">Active Listings</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Applications</span>
          <div className="text-2xl font-black text-purple-600 font-mono tabular-nums">
            {metrics?.total_applications || 0}
          </div>
          <span className="text-[10px] text-slate-500">Platform-Wide Submissions</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Successful Hires</span>
          <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums">
            {metrics?.successful_hires || 0}
          </div>
          <span className="text-[10px] text-slate-500">Applications in HIRED status</span>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">User Management</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            View all registered candidate, recruiter, and administrator accounts. Activate or deactivate user credentials.
          </p>
          <Link
            to="/admin/users"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <span>Manage Users</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Job Moderation</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspect all platform job postings. Oversee job status (OPEN, CLOSED, DRAFT) across recruiters.
          </p>
          <Link
            to="/admin/jobs"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <span>Moderate Job Postings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {showOutboxModal && <OutboxModal onClose={() => setShowOutboxModal(false)} />}
    </div>
  );
};
