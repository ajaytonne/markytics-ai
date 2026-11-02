import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Job, Application } from '../types';
import {
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  Upload,
  FileText,
  AlertCircle,
  ArrowLeft,
  X,
  Lock,
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isCandidate } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const fetchJobDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/jobs/${id}/`);
      setJob(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchJobDetail();
  }, [id]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setSubmitting(true);
    setApplyError(null);

    try {
      const formData = new FormData();
      formData.append('job_id', job.id);
      formData.append('cover_letter', coverLetter);
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      await api.post('/applications/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setApplySuccess(true);
      setShowApplyModal(false);
      fetchJobDetail();
    } catch (err: any) {
      setApplyError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-12 text-center text-xs text-slate-400">Loading position specifications...</div>;
  }

  if (error || !job) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Unable to Load Position</h2>
        <p className="text-xs text-slate-500">{error || 'Job post not found.'}</p>
        <Link to="/jobs" className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-semibold inline-block">
          Back to Open Jobs
        </Link>
      </div>
    );
  }

  const isExpired = job.application_deadline ? new Date(job.application_deadline) < new Date() : false;
  const isClosed = job.status !== 'OPEN' || isExpired;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Job Listings</span>
      </Link>

      {/* Hero Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>{job.category_name || 'General Track'}</span>
              <span>&middot;</span>
              <span>{job.employment_type.replace('_', ' ')}</span>
              <span>&middot;</span>
              <span>{job.workplace_type}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                <Building2 className="w-4 h-4 text-slate-400" />
                {job.company_name || 'Markytics Consulting Pvt Ltd'}
              </span>
              <span>&middot;</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                {job.location}
              </span>
              <span>&middot;</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-4 h-4 text-slate-400" />
                Posted {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {job.existing_application ? (
              <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Applied ({job.existing_application.status})</span>
              </div>
            ) : isClosed ? (
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span>Applications Closed</span>
              </div>
            ) : isCandidate ? (
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Apply Now with Resume</span>
              </button>
            ) : user ? (
              <div className="text-xs text-slate-500 italic">
                Logged in as {user.role}. Switch to candidate role to submit application.
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Sign In as Candidate to Apply
              </Link>
            )}

            {job.application_deadline && (
              <span className="text-[11px] text-slate-500 font-mono">
                Deadline: {new Date(job.application_deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Compensation</span>
            <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
              {job.salary_currency} {job.min_salary.toLocaleString()} - {job.max_salary.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 uppercase">Per {job.salary_period}</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Experience Level</span>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {job.min_experience} to {job.max_experience} Years
            </div>
            <span className="text-[10px] text-slate-500">Required Experience</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Recruiter / Manager</span>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {job.recruiter_name || 'Markytics Hiring Team'}
            </div>
            <span className="text-[10px] text-slate-500">Verified Recruiter</span>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-4 pt-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Position Overview & Responsibilities</h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Required Skills */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Required Technical Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((s) => (
              <span
                key={s}
                className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-100 dark:border-indigo-900"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Application Success Banner */}
      {applySuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs space-y-2">
          <div className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Application Submitted Successfully!</span>
          </div>
          <p>
            Your resume and application details have been received. Track your status updates live in your{' '}
            <Link to="/candidate/applications" className="underline font-bold">
              Candidate Applications Dashboard
            </Link>
            .
          </p>
        </div>
      )}

      {/* Submit Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Apply for {job.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {job.company_name || 'Markytics Consulting Pvt Ltd'}
                </p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applyError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-700 dark:text-red-300 text-xs rounded-lg">
                {applyError}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              {/* Resume File Upload (PDF Only, Max 5MB) */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-900 dark:text-slate-200 block">
                  Upload PDF Resume <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800/40">
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setResumeFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id="resume-upload-input"
                  />
                  <label htmlFor="resume-upload-input" className="cursor-pointer space-y-2 block">
                    <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {resumeFile ? resumeFile.name : 'Click to select your PDF resume file'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      PDF format only, maximum size 5 MB. Validated on server.
                    </div>
                  </label>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-900 dark:text-slate-200 block">
                  Optional Cover Letter
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain why you are a great fit for this position at Markytics..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
