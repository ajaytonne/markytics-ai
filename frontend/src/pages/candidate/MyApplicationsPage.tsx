import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Application } from '../../types';
import { StatusTimeline } from '../../components/common/StatusTimeline';
import { ResumeViewerModal } from '../../components/common/ResumeViewerModal';
import { FileText, Download, Eye, Briefcase, Building2, Clock, CheckCircle2 } from 'lucide-react';

export const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [viewingResumeApp, setViewingResumeApp] = useState<Application | null>(null);

  const fetchMyApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications/my/');
      setApplications(res.data);
      if (res.data.length > 0 && !selectedApp) {
        // Load full details for first application
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
    fetchMyApplications();
  }, []);

  const handleSelectApp = async (appId: string) => {
    try {
      const detailRes = await api.get(`/applications/${appId}/`);
      setSelectedApp(detailRes.data);
    } catch (_err) {
      // ignore
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          My Submitted Applications
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          View application stage transitions, candidate messages, and resume uploads.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading your applications...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Applications Submitted Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse open positions at Markytics Consulting to submit your resume.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications Master List */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Applications ({applications.length})
            </h3>
            <div className="space-y-2">
              {applications.map((app) => (
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
                      {app.job_title}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shrink-0">
                      {app.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{app.company_name}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono pt-1">
                    Applied {new Date(app.applied_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Application Detail View & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {selectedApp ? (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Application Record &middot; ID: {selectedApp.id}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {selectedApp.job_title}
                    </h2>
                    <p className="text-xs text-slate-500">{selectedApp.company_name}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingResumeApp(selectedApp)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>View PDF Resume</span>
                    </button>
                  </div>
                </div>

                {/* Submitted Cover Letter */}
                {selectedApp.cover_letter && (
                  <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Submitted Cover Letter</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic whitespace-pre-line">
                      "{selectedApp.cover_letter}"
                    </p>
                  </div>
                )}

                {/* Status Timeline */}
                <StatusTimeline
                  history={selectedApp.history || []}
                  currentStatus={selectedApp.status}
                />
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                Select an application from the left list to view stage progress and messages.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resume Modal */}
      {viewingResumeApp && (
        <ResumeViewerModal
          applicationId={viewingResumeApp.id}
          candidateName={viewingResumeApp.candidate_name || 'Candidate'}
          originalFilename={viewingResumeApp.original_resume_name || 'Resume.pdf'}
          onClose={() => setViewingResumeApp(null)}
        />
      )}
    </div>
  );
};
