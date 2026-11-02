import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RecruiterMetrics } from '../../types';
import { Briefcase, Users, PlusCircle, CheckCircle2, Clock, ArrowRight, UserCheck, Search } from 'lucide-react';

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<RecruiterMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboards/recruiter/');
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
    return <div className="max-w-7xl mx-auto p-12 text-center text-xs text-slate-400">Loading recruiter hiring metrics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Recruiter Hiring Workspace & Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Scoped metrics for jobs owned by <strong>{user?.first_name} {user?.last_name}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/recruiter/candidates"
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-semibold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <Search className="w-4 h-4 text-indigo-600" />
            <span>Search Talent Pool</span>
          </Link>
          <Link
            to="/recruiter/jobs/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Job</span>
          </Link>
        </div>
      </div>

      {/* Recruiter Scoped Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Open Jobs</span>
          <div className="text-2xl font-black text-indigo-600 font-mono tabular-nums">
            {metrics?.open_jobs_count || 0}
          </div>
          <span className="text-[10px] text-slate-500">Currently Accepting Applications</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Applicants</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
            {metrics?.total_applications || 0}
          </div>
          <span className="text-[10px] text-slate-500">Across Owned Postings</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <span className="text-[10px] text-purple-600 uppercase font-bold tracking-wider">Shortlisted</span>
          <div className="text-2xl font-black text-purple-600 font-mono tabular-nums">
            {metrics?.shortlisted_count || 0}
          </div>
          <span className="text-[10px] text-slate-500">In Screening</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <span className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">Interview</span>
          <div className="text-2xl font-black text-amber-600 font-mono tabular-nums">
            {metrics?.interview_count || 0}
          </div>
          <span className="text-[10px] text-slate-500">Scheduled Interviews</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
          <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Successful Hires</span>
          <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums">
            {metrics?.hired_count || 0}
          </div>
          <span className="text-[10px] text-slate-500">Extended Offers</span>
        </div>
      </div>

      {/* Recent Applicants Pipeline stream */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Applicants Stream</h3>
            <p className="text-xs text-slate-500">Latest candidate submissions for your job postings.</p>
          </div>
          <Link to="/recruiter/applicants" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Manage Applicant Pipeline &rarr;
          </Link>
        </div>

        {metrics?.recent_applicants.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <div>No applicants received for your jobs yet.</div>
            <Link to="/recruiter/jobs/new" className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold inline-block">
              Create a Job Post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                  <th className="pb-3 font-semibold">Candidate Name</th>
                  <th className="pb-3 font-semibold">Job Title</th>
                  <th className="pb-3 font-semibold">Applied Date</th>
                  <th className="pb-3 font-semibold">Current Stage</th>
                  <th className="pb-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {metrics?.recent_applicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{app.candidate_name}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{app.job_title}</td>
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
                        to={`/recruiter/applicants?job_id=${app.job_id}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                      >
                        Review Resume & Stage
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
