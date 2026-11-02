import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CandidateMetrics } from '../../types';
import { Briefcase, CheckCircle2, Clock, XCircle, ArrowRight, User, Award, ExternalLink } from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<CandidateMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboards/candidate/');
        setMetrics(res.data);
      } catch (_err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto p-12 text-center text-xs text-slate-400">Loading candidate metrics...</div>;
  }

  const counts = metrics?.status_counts || {
    APPLIED: 0,
    SHORTLISTED: 0,
    INTERVIEW: 0,
    REJECTED: 0,
    HIRED: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your Markytics Consulting internship & employment application progress.
          </p>
        </div>
        <Link
          to="/jobs"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 self-start"
        >
          <Briefcase className="w-4 h-4" />
          <span>Explore More Openings</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Submitted</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
            {metrics?.total_applications || 0}
          </div>
          <span className="text-[10px] text-slate-500">Applications</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <span className="text-[10px] text-purple-600 uppercase font-bold tracking-wider">Shortlisted</span>
          <div className="text-2xl font-black text-purple-600 font-mono tabular-nums">
            {counts.SHORTLISTED}
          </div>
          <span className="text-[10px] text-slate-500">Passed Screening</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <span className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">Interview</span>
          <div className="text-2xl font-black text-amber-600 font-mono tabular-nums">
            {counts.INTERVIEW}
          </div>
          <span className="text-[10px] text-slate-500">Technical Evaluation</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Hired</span>
          <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums">
            {counts.HIRED}
          </div>
          <span className="text-[10px] text-slate-500">Successful Offers</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <span className="text-[10px] text-red-500 uppercase font-bold tracking-wider">Rejected</span>
          <div className="text-2xl font-black text-slate-400 font-mono tabular-nums">
            {counts.REJECTED}
          </div>
          <span className="text-[10px] text-slate-500">Unsuccessful</span>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Application Activity</h3>
            <p className="text-xs text-slate-500">Your latest submitted job applications & status updates.</p>
          </div>
          <Link to="/candidate/applications" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            View All Applications &rarr;
          </Link>
        </div>

        {metrics?.recent_activity.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <div>No applications submitted yet.</div>
            <Link to="/jobs" className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold inline-block">
              Browse Open Positions
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                  <th className="pb-3 font-semibold">Position Title</th>
                  <th className="pb-3 font-semibold">Company</th>
                  <th className="pb-3 font-semibold">Applied Date</th>
                  <th className="pb-3 font-semibold">Current Stage</th>
                  <th className="pb-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {metrics?.recent_activity.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{app.job_title}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{app.company_name}</td>
                    <td className="py-3 font-mono text-slate-500">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to="/candidate/applications"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                      >
                        Timeline & Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
