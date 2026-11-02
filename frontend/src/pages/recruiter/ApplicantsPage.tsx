import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { Application, ApplicationStatus } from '../../types';
import { StatusTimeline } from '../../components/common/StatusTimeline';
import { ResumeViewerModal } from '../../components/common/ResumeViewerModal';
import {
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  MessageSquare,
  Building2,
  X,
  AlertCircle,
} from 'lucide-react';

export const ApplicantsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const filterJobId = searchParams.get('job_id') || '';

  const [applicants, setApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [viewingResumeApp, setViewingResumeApp] = useState<Application | null>(null);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Status Transition Modal
  const [transitioningApp, setTransitioningApp] = useState<Application | null>(null);
  const [targetStatus, setTargetStatus] = useState<ApplicationStatus>('SHORTLISTED');
  const [candidateMessage, setCandidateMessage] = useState('');
  const [updating, setUpdating] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterJobId) params.job_id = filterJobId;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/applications/recruiter/', { params });
      setApplicants(res.data);
      if (res.data.length > 0 && !selectedApp) {
        const detailRes = await api.get(`/applications/${res.data[0].id}/`);
        setSelectedApp(detailRes.data);
      }
    } catch (_err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [filterJobId, statusFilter]);

  const handleSelectApp = async (appId: string) => {
    try {
      const detailRes = await api.get(`/applications/${appId}/`);
      setSelectedApp(detailRes.data);
    } catch (_err) {
      // ignore
    }
  };

  const openTransitionModal = (app: Application, nextStatus: ApplicationStatus) => {
    setTransitioningApp(app);
    setTargetStatus(nextStatus);
    setCandidateMessage(
      nextStatus === 'SHORTLISTED'
        ? 'Your profile has been shortlisted by our technical hiring panel.'
        : nextStatus === 'INTERVIEW'
        ? 'We invite you for an interview with our technical engineering lead.'
        : nextStatus === 'HIRED'
        ? 'Congratulations! We are pleased to extend a formal internship/job offer.'
        : 'Thank you for applying to Markytics Consulting. Unfortunately, we are not proceeding with your application at this time.'
    );
    setTransitionError(null);
  };

  const handleExecuteTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transitioningApp) return;
    setUpdating(true);
    setTransitionError(null);

    try {
      const res = await api.post(`/applications/${transitioningApp.id}/status/`, {
        new_status: targetStatus,
        candidate_message: candidateMessage,
      });

      setTransitioningApp(null);
      // Refresh current details
      fetchApplicants();
      if (selectedApp && selectedApp.id === transitioningApp.id) {
        const detailRes = await api.get(`/applications/${transitioningApp.id}/`);
        setSelectedApp(detailRes.data);
      }
    } catch (err: any) {
      setTransitionError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Applicant Screening Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review candidate resumes, inspect profiles, and transition hiring stages with validated business rules.
          </p>
        </div>

        {/* Stage Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Stage:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="">All Stages</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="HIRED">Hired</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading applicant pipeline...</div>
      ) : applicants.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Applicants Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no applicant submissions matching the selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applicant Stream List */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Applicants ({applicants.length})
            </h3>
            <div className="space-y-2">
              {applicants.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleSelectApp(app.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all block space-y-2 ${
                    selectedApp?.id === app.id
                      ? 'bg-white dark:bg-slate-900 border-indigo-600 dark:border-indigo-500 shadow-md ring-1 ring-indigo-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {app.candidate_name}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shrink-0">
                      {app.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 line-clamp-1">
                    Applied for: <strong className="text-slate-700 dark:text-slate-300">{app.job_title}</strong>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono pt-1 flex justify-between">
                    <span>{app.candidate_email}</span>
                    <span>{new Date(app.applied_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Candidate Evaluation Panel */}
          <div className="lg:col-span-2 space-y-6">
            {selectedApp ? (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Applicant &middot; {selectedApp.candidate_email}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedApp.candidate_name}
                    </h2>
                    <p className="text-xs text-slate-500">Target Role: {selectedApp.job_title}</p>
                  </div>

                  {/* Actions & Resume Button */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setViewingResumeApp(selectedApp)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>View PDF Resume</span>
                    </button>
                  </div>
                </div>

                {/* Status Transition Action Bar */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Stage Action Controls (Current: {selectedApp.status})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Backend Validated</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedApp.status === 'APPLIED' && (
                      <>
                        <button
                          onClick={() => openTransitionModal(selectedApp, 'SHORTLISTED')}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg transition-colors"
                        >
                          Shortlist Candidate
                        </button>
                        <button
                          onClick={() => openTransitionModal(selectedApp, 'REJECTED')}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {selectedApp.status === 'SHORTLISTED' && (
                      <>
                        <button
                          onClick={() => openTransitionModal(selectedApp, 'INTERVIEW')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors"
                        >
                          Schedule Interview
                        </button>
                        <button
                          onClick={() => openTransitionModal(selectedApp, 'REJECTED')}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {selectedApp.status === 'INTERVIEW' && (
                      <>
                        <button
                          onClick={() => openTransitionModal(selectedApp, 'HIRED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors"
                        >
                          Extend Offer (Hire)
                        </button>
                        <button
                          onClick={() => openTransitionModal(selectedApp, 'REJECTED')}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {(selectedApp.status === 'HIRED' || selectedApp.status === 'REJECTED') && (
                      <span className="text-xs text-slate-500 italic">
                        Terminal Status ({selectedApp.status}). No further transitions.
                      </span>
                    )}
                  </div>
                </div>

                {/* Candidate Profile summary */}
                {selectedApp.candidate_profile && (
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <h4 className="font-bold text-slate-900 dark:text-white">Candidate Qualifications</h4>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Headline:</strong> {selectedApp.candidate_profile.headline || 'Not specified'}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Experience:</strong> {selectedApp.candidate_profile.years_of_experience} Years &middot; Location: {selectedApp.candidate_profile.location}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {selectedApp.candidate_profile.skills?.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded text-[10px] font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submitted Cover Letter */}
                {selectedApp.cover_letter && (
                  <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Candidate Statement</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic whitespace-pre-line">
                      "{selectedApp.cover_letter}"
                    </p>
                  </div>
                )}

                {/* Status History Timeline */}
                <StatusTimeline
                  history={selectedApp.history || []}
                  currentStatus={selectedApp.status}
                />
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                Select an applicant from the left list to review resume and manage status transitions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resume Viewer Modal */}
      {viewingResumeApp && (
        <ResumeViewerModal
          applicationId={viewingResumeApp.id}
          candidateName={viewingResumeApp.candidate_name || 'Candidate'}
          originalFilename={viewingResumeApp.original_resume_name || 'Resume.pdf'}
          onClose={() => setViewingResumeApp(null)}
        />
      )}

      {/* Transition Modal with Candidate Message field */}
      {transitioningApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Transition Candidate Stage &rarr; {targetStatus}
              </h3>
              <button
                onClick={() => setTransitioningApp(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {transitionError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-700 dark:text-red-300 text-xs rounded-lg">
                {transitionError}
              </div>
            )}

            <form onSubmit={handleExecuteTransition} className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-slate-800 dark:text-slate-200">
                Transitioning <strong>{transitioningApp.candidate_name}</strong> from{' '}
                <strong className="underline">{transitioningApp.status}</strong> to{' '}
                <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{targetStatus}</strong>.
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Candidate-Visible Message (Trigger Email Notification Outbox)
                </label>
                <textarea
                  rows={4}
                  value={candidateMessage}
                  onChange={(e) => setCandidateMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTransitioningApp(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50"
                >
                  {updating ? 'Executing Transition...' : 'Confirm Stage Transition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
