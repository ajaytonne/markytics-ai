import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Job, JobCategory } from '../types';
import {
  Search,
  MapPin,
  Briefcase,
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Building2,
  DollarSign,
  Clock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, catRes] = await Promise.all([
          api.get('/jobs/'),
          api.get('/categories/'),
        ]);
        setFeaturedJobs(jobsRes.data.slice(0, 4));
        setCategories(catRes.data);
      } catch (_err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(selectedCategory)}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden rounded-b-3xl py-16 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 via-slate-900 to-purple-900/30 opacity-70 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 space-y-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Markytics Consulting Pvt Ltd Intern Onboarding Program</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight text-wrap-balance">
            Launch Your Career in Data Analytics, AI & High-Impact Consulting
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover internships, full-time engineering roles, and analytics positions. Apply with ease, track your application timeline in real time, and connect directly with hiring managers.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white dark:bg-slate-800 p-2 sm:p-3 rounded-2xl shadow-xl max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-2 border border-slate-200 dark:border-slate-700"
          >
            <div className="sm:col-span-5 flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Job title, skill (e.g. Python, SQL)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-hidden placeholder-slate-400"
              />
            </div>

            <div className="sm:col-span-4 flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="text-slate-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="sm:col-span-3 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>Find Positions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Stats Bar */}
          <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div>
              <div className="text-2xl font-black text-white font-mono tabular-nums">100+</div>
              <div className="text-xs text-slate-400">Intern & Entry Roles</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono tabular-nums">100%</div>
              <div className="text-xs text-slate-400">Transparent Hiring Stage</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono tabular-nums">5 MB</div>
              <div className="text-xs text-slate-400">Private PDF Uploads</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono tabular-nums">24/7</div>
              <div className="text-xs text-slate-400">Live Status Notifications</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Explore Internship & Engineering Domains
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a specialized track to discover open opportunities at Markytics Consulting.
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All Job Postings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/jobs?category=${c.id}`}
              className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {c.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Data science, ML models, full-stack systems & consulting tracks.
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Job Openings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Featured Job Openings
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Latest published positions accepting candidate resumes.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading open job positions...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {job.employment_type.replace('_', ' ')} &middot; {job.workplace_type}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        <Link to={`/jobs/${job.id}`} className="hover:text-indigo-600 transition-colors">
                          {job.title}
                        </Link>
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded text-xs font-bold shrink-0">
                      OPEN
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {job.company_name || 'Markytics Consulting'}
                    </span>
                    <span>&middot;</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                    {job.salary_currency} {job.min_salary.toLocaleString()} - {job.max_salary.toLocaleString()}{' '}
                    <span className="text-[10px] text-slate-400 uppercase">/{job.salary_period}</span>
                  </div>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <span>View & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Program Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-2xl p-8 lg:p-12 text-white border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Secure Private Resume Upload</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              PDF resumes are protected with authenticated role-based download guards. Only assigned recruiters and admins can download applicant CVs.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Validated Hiring Stages</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict backend workflow rules enforce valid stage transitions (APPLIED &rarr; SHORTLISTED &rarr; INTERVIEW &rarr; HIRED).
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Candidate Talent Directory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recruiters can search public candidate profiles and applicants with multi-skill filters and experience constraints.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
