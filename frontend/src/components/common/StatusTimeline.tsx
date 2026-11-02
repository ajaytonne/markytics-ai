import React from 'react';
import { ApplicationStatusHistory } from '../../types';
import { CheckCircle2, Clock, XCircle, ArrowRight, UserCheck } from 'lucide-react';

interface StatusTimelineProps {
  history: ApplicationStatusHistory[];
  currentStatus: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ history, currentStatus }) => {
  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'SHORTLISTED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'INTERVIEW':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'HIRED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Application Status History</h4>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getBadgeColor(currentStatus)}`}>
          Current: {currentStatus}
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {history.length === 0 ? (
          <div className="text-xs text-slate-400">No status changes recorded yet.</div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline marker node */}
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center text-white">
                <CheckCircle2 className="w-3 h-3" />
              </div>

              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                    <span>{item.previous_status === 'NONE' ? 'Submitted' : item.previous_status}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getBadgeColor(item.new_status)}`}>
                      {item.new_status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(item.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-slate-400" />
                  <span>Action by: {item.actor_name}</span>
                </div>

                {item.candidate_message && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 italic">
                    "{item.candidate_message}"
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
