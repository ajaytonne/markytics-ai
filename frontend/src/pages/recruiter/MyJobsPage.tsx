import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Job } from '../../types';
import { Briefcase, PlusCircle, Users, Edit3, Power, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export const MyJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOwnedJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs/', { params: { scope: 'owned' } });
      setJobs(res.data);
    } catch (_err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnedJobs();
  }, []);

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await api.post(`/jobs/${jobId}/status/`, { status: nextStatus });
      fetchOwnedJobs();
    } catch (_err) {
      // ignore
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Owned Job Listings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage job posts, edit specifications, publish/close status, and review applicants.
          </p>
        </div>
        <Link
          to="/recruiter/jobs/new"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Opening</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading your job posts...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Jobs Posted Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first draft or open job position to start receiving candidate applications.
          </p>
          <Link
            to="/recruiter/jobs/new"
            className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-lg hover:bg-indigo-700 transition-colors inline-block"
          >
            Create Job Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {job.category_name || 'General Track'} &middot; {job.employment_type}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {job.title}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold shrink-0 ${
                      job.status === 'OPEN'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : job.status === 'DRAFT'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-mono">
                  Location: {job.location} | Created: {new Date(job.created_at).toLocaleDateString()}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {job.description}
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-lg flex items-center gap-1 font-mono">
                    <Users className="w-3.5 h-3.5" />
                    {job.applications_count || 0} Applicants
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Experience: {job.min_experience}-{job.max_experience} yrs
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/recruiter/jobs/edit/${job.id}`}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-semibold flex items-center gap-1"
                    title="Edit Job"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={() => handleToggleStatus(job.id, job.status)}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-semibold flex items-center gap-1"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{job.status === 'OPEN' ? 'Close Job' : 'Publish Job'}</span>
                  </button>
                </div>

                <Link
                  to={`/recruiter/applicants?job_id=${job.id}`}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>Review Applicants</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
