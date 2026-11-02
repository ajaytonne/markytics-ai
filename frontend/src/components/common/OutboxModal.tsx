import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { EmailNotification } from '../../types';
import { X, Mail, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

interface OutboxModalProps {
  onClose: () => void;
}

export const OutboxModal: React.FC<OutboxModalProps> = ({ onClose }) => {
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);

  const fetchOutbox = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/outbox/');
      setEmails(res.data);
      if (res.data.length > 0 && !selectedEmail) {
        setSelectedEmail(res.data[res.data.length - 1]);
      }
    } catch (_err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutbox();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Local SMTP Email Outbox Inspector
              </h3>
              <p className="text-xs text-slate-500">
                Database-backed transactional email outbox for candidate notifications & password resets
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOutbox}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded transition-colors"
              title="Refresh outbox"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 overflow-hidden">
          {/* Email List */}
          <div className="overflow-y-auto max-h-96 md:max-h-full divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading outbox...</div>
            ) : emails.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No email notifications sent yet.</div>
            ) : (
              emails.slice().reverse().map((email) => (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`w-full text-left p-3 text-xs transition-colors block ${
                    selectedEmail?.id === email.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-l-2 border-indigo-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-slate-900 dark:text-slate-200 truncate">
                      {email.recipient_email}
                    </span>
                    <span className="shrink-0 text-[10px] text-slate-400 font-mono">
                      {new Date(email.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 font-medium truncate mb-1">
                    {email.subject}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Sent
                    </span>
                    <span>&middot;</span>
                    <span className="font-mono">{email.template_id}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Email Detail Preview */}
          <div className="md:col-span-2 p-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
            {selectedEmail ? (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 font-mono">
                    <span>To: <strong className="text-slate-900 dark:text-white">{selectedEmail.recipient_email}</strong></span>
                    <span>{new Date(selectedEmail.created_at).toLocaleString()}</span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    Subject: {selectedEmail.subject}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Event Ref: {selectedEmail.event_ref} | Delivery: {selectedEmail.delivery_state}
                  </div>
                </div>

                {/* Simulated Email Body Content */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <div className="border-b border-slate-100 dark:border-slate-700 pb-3 font-bold text-slate-900 dark:text-white">
                    Markytics Consulting Pvt Ltd - Automated Notification
                  </div>

                  {selectedEmail.template_id === 'STATUS_CHANGE_NOTIFICATION' && (
                    <div className="space-y-3">
                      <p>Dear <strong>{selectedEmail.render_data?.candidate_name || 'Candidate'}</strong>,</p>
                      <p>
                        Your application for <strong>{selectedEmail.render_data?.job_title}</strong> at{' '}
                        <strong>{selectedEmail.render_data?.company_name}</strong> has been updated.
                      </p>
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 rounded-md font-mono text-xs">
                        <div>Previous Status: {selectedEmail.render_data?.previous_status}</div>
                        <div className="font-bold text-indigo-700 dark:text-indigo-400">
                          New Status: {selectedEmail.render_data?.new_status}
                        </div>
                      </div>
                      {selectedEmail.render_data?.candidate_message && (
                        <div>
                          <span className="font-semibold block mb-1">Message from Recruiter:</span>
                          <blockquote className="italic border-l-2 border-indigo-400 pl-3 py-1 text-slate-600 dark:text-slate-400">
                            "{selectedEmail.render_data?.candidate_message}"
                          </blockquote>
                        </div>
                      )}
                      <p className="pt-2">
                        Log in to your Markytics Candidate Dashboard to view the complete application timeline.
                      </p>
                    </div>
                  )}

                  {selectedEmail.template_id === 'PASSWORD_RESET' && (
                    <div className="space-y-3">
                      <p>Hello <strong>{selectedEmail.render_data?.name}</strong>,</p>
                      <p>We received a request to reset your password for your Markytics Account.</p>
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-md">
                        <span className="font-mono text-xs block text-amber-900 dark:text-amber-300 break-all">
                          {selectedEmail.render_data?.reset_link}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        This single-use reset token will expire in 24 hours.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Select an email from the left list to preview notification headers & render payload.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
