import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { CandidateProfile } from '../../types';
import { Search, UserCheck, Shield, MapPin, Briefcase, ExternalLink, Filter } from 'lucide-react';

export const CandidateSearchPage: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [skill, setSkill] = useState('');
  const [minExp, setMinExp] = useState('');

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (query) params.query = query;
      if (skill) params.skill = skill;
      if (minExp) params.min_exp = minExp;

      const res = await api.get('/candidates/search/', { params });
      setCandidates(res.data);
    } catch (_err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Recruiter Talent Search Directory
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Search candidate profiles explicitly set to PUBLIC visibility or applicants to your posted jobs. Private profiles remain hidden per platform privacy matrix.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name, headline, skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <div className="sm:col-span-3">
          <input
            type="text"
            placeholder="Skill (e.g. Python, SQL)"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <div className="sm:col-span-2">
          <input
            type="number"
            min={0}
            placeholder="Min Experience (yrs)"
            value={minExp}
            onChange={(e) => setMinExp(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <button
          type="submit"
          className="sm:col-span-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1"
        >
          <span>Search Talent</span>
        </button>
      </form>

      {/* Candidate Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Searching candidate directory...</div>
      ) : candidates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Candidate Profiles Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria. Only public profiles or applicants to your jobs appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((cand) => (
            <div
              key={cand.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {cand.first_name} {cand.last_name}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {cand.headline || 'Markytics Candidate'}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cand.search_visibility === 'PUBLIC'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {cand.search_visibility}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {cand.bio || 'No bio provided.'}
                </p>

                <div className="text-xs text-slate-500 flex items-center gap-3 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {cand.location || 'India'}
                  </span>
                  <span>&middot;</span>
                  <span>{cand.years_of_experience} Years Exp</span>
                </div>

                <div className="flex flex-wrap gap-1 pt-2">
                  {cand.skills?.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Contact: {cand.email}</span>
                {cand.portfolio_url && (
                  <a
                    href={cand.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Portfolio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
