import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="text-white font-bold text-lg tracking-tight">
              Markytics<span className="text-indigo-500">Careers</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Markytics Consulting Pvt Ltd Intern Onboarding Program & Recruitment Management System. Connecting top analytics & tech talent with high-impact roles.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">For Candidates</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Open Positions</Link></li>
              <li><Link to="/candidate/dashboard" className="hover:text-white transition-colors">Application Tracker</Link></li>
              <li><Link to="/candidate/profile" className="hover:text-white transition-colors">Candidate Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">For Recruiters</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/recruiter/dashboard" className="hover:text-white transition-colors">Hiring Dashboard</Link></li>
              <li><Link to="/recruiter/jobs/new" className="hover:text-white transition-colors">Post Internship / Full-time Job</Link></li>
              <li><Link to="/recruiter/candidates" className="hover:text-white transition-colors">Search Talent Pool</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Architecture & Tech</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/docs" className="hover:text-white transition-colors">REST API & Swagger Specs</Link></li>
              <li className="text-slate-500">Django 5.0 REST Framework</li>
              <li className="text-slate-500">PostgreSQL Full-Text Search</li>
              <li className="text-slate-500">HttpOnly Session & CSRF Cookies</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} Markytics Consulting Pvt Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition-colors">Privacy Policy</span>
            <span>&middot;</span>
            <span className="hover:text-slate-400 transition-colors">Terms of Service</span>
            <span>&middot;</span>
            <span className="hover:text-slate-400 transition-colors">Security Hardening</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
