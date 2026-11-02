import React, { useState } from 'react';
import { Code, Server, Shield, Check, Copy } from 'lucide-react';

export const ApiDocsPage: React.FC = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      group: 'Authentication & Session',
      routes: [
        { method: 'GET', path: '/api/v1/auth/csrf/', desc: 'Initialize CSRF token cookie.' },
        { method: 'POST', path: '/api/v1/auth/register/', desc: 'Public registration (Role: CANDIDATE or RECRUITER only).' },
        { method: 'POST', path: '/api/v1/auth/login/', desc: 'Session login with HttpOnly sessionid cookie.' },
        { method: 'POST', path: '/api/v1/auth/logout/', desc: 'Destroy active session.' },
        { method: 'GET', path: '/api/v1/auth/me/', desc: 'Retrieve authenticated user session profile.' },
        { method: 'POST', path: '/api/v1/auth/password-reset/', desc: 'Request expiring single-use reset token (generic response).' },
        { method: 'POST', path: '/api/v1/auth/password-reset-confirm/', desc: 'Confirm single-use password token reset.' },
      ],
    },
    {
      group: 'Profiles & Talent Search',
      routes: [
        { method: 'GET', path: '/api/v1/profiles/candidate/', desc: 'Candidate own profile.' },
        { method: 'PUT', path: '/api/v1/profiles/candidate/', desc: 'Update candidate skills, bio, and search visibility setting.' },
        { method: 'GET', path: '/api/v1/profiles/recruiter/', desc: 'Recruiter own profile & company settings.' },
        { method: 'GET', path: '/api/v1/candidates/search/', desc: 'Recruiter directory search (query, skill, min_exp).' },
      ],
    },
    {
      group: 'Jobs & Categories',
      routes: [
        { method: 'GET', path: '/api/v1/jobs/', desc: 'Public job list with PostgreSQL full-text search, skills ALL filter, and pagination.' },
        { method: 'GET', path: '/api/v1/jobs/:id/', desc: 'Job detail view.' },
        { method: 'POST', path: '/api/v1/jobs/', desc: 'Create job posting (Recruiters only).' },
        { method: 'PUT', path: '/api/v1/jobs/:id/', desc: 'Edit owned job posting (Recruiter ownership enforced).' },
        { method: 'POST', path: '/api/v1/jobs/:id/status/', desc: 'Publish, close, or draft status toggle.' },
      ],
    },
    {
      group: 'Applications & Stage Workflow',
      routes: [
        { method: 'POST', path: '/api/v1/applications/', desc: 'Submit application with PDF resume file upload (1 app per job constraint).' },
        { method: 'GET', path: '/api/v1/applications/my/', desc: 'Candidate own applications list.' },
        { method: 'GET', path: '/api/v1/applications/recruiter/', desc: 'Recruiter applicant stream for owned jobs.' },
        { method: 'GET', path: '/api/v1/applications/:id/', desc: 'Application detail & stage transition history timeline.' },
        { method: 'POST', path: '/api/v1/applications/:id/status/', desc: 'Transition hiring stage (APPLIED -> SHORTLISTED -> INTERVIEW -> HIRED).' },
        { method: 'GET', path: '/api/v1/applications/:id/resume/', desc: 'Secure authorized PDF resume download (Content-Disposition attachment).' },
      ],
    },
    {
      group: 'Metrics & Dashboards',
      routes: [
        { method: 'GET', path: '/api/v1/dashboards/candidate/', desc: 'Candidate scoped counts & recent activity.' },
        { method: 'GET', path: '/api/v1/dashboards/recruiter/', desc: 'Recruiter scoped open jobs & stage counts.' },
        { method: 'GET', path: '/api/v1/dashboards/admin/', desc: 'Platform-wide aggregates (active users, jobs posted, hires).' },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Server className="w-6 h-6 text-indigo-600" />
          <span>DRF OpenAPI Schema & Swagger Documentation</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          OpenAPI REST endpoints for Markytics Consulting Recruitment Platform.
        </p>
      </div>

      <div className="space-y-8">
        {endpoints.map((group, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              {group.group}
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {group.routes.map((route, rIdx) => {
                const routeId = `${group.group}-${rIdx}`;
                return (
                  <div key={rIdx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          route.method === 'GET'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : route.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {route.method}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{route.path}</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-500">
                      <span>{route.desc}</span>
                      <button
                        onClick={() => copyToClipboard(route.path, routeId)}
                        className="p-1 hover:text-indigo-600 transition-colors"
                        title="Copy Route Path"
                      >
                        {copiedEndpoint === routeId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
