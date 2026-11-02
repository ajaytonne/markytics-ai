import React from 'react';
import { X, Download, FileText, ExternalLink, ShieldCheck } from 'lucide-react';

interface ResumeViewerModalProps {
  applicationId: string;
  candidateName: string;
  originalFilename: string;
  onClose: () => void;
}

export const ResumeViewerModal: React.FC<ResumeViewerModalProps> = ({
  applicationId,
  candidateName,
  originalFilename,
  onClose,
}) => {
  const resumeUrl = `/api/v1/applications/${applicationId}/resume/`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Resume: {candidateName}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {originalFilename} &middot; Secure Authorized Access Only
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={resumeUrl}
              download={originalFilename}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Frame */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2 relative">
          <iframe
            src={`${resumeUrl}#toolbar=0`}
            title={`Resume of ${candidateName}`}
            className="w-full h-full rounded border border-slate-200 dark:border-slate-800 bg-white"
          />
        </div>

        {/* Security Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Private Resume Storage &middot; Content-Disposition Attachment Header</span>
          </div>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 flex items-center gap-1 text-[11px]"
          >
            <span>Open in New Tab</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
