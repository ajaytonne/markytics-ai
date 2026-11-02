import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Job } from '../../types';
import { Briefcase, Power, ArrowRight, Building2 } from 'lucide-react';

export const AdminJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs/', { params: { scope: 'all' } });
      setJobs(res.data);
    } catch (_err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await api.post(`/jobs/${jobId}/status/`, { status: nextStatus });
      fetchAllJobs();
    } catch (_err) {
      // ignore
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Admin Job Moderation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Oversee all platform job postings. Force close or re-publish listings across recruiters.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading job postings...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="p-4">Job Title</th>
                  <th className="p-4">Company / Recruiter</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Applicants</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{job.title}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      <div>{job.company_name}</div>
                      <div className="text-[10px] text-slate-400">{job.recruiter_name}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                          job.status === 'OPEN'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      {job.applications_count || 0}
                    </td>
                    <td className="p-4 font-mono text-slate-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(job.id, job.status)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold rounded text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <Power className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{job.status === 'OPEN' ? 'Close Posting' : 'Publish Posting'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
