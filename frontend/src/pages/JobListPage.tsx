import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Job, JobCategory, Skill } from '../types';
import {
  Search,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  ArrowRight,
  X,
  Filter,
  DollarSign,
  Building2,
} from 'lucide-react';

export const JobListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States synced with URL query parameters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [employmentType, setEmploymentType] = useState(searchParams.get('employment_type') || '');
  const [workplaceType, setWorkplaceType] = useState(searchParams.get('workplace_type') || '');
  const [minExp, setMinExp] = useState(searchParams.get('min_experience') || '');
  const [minSal, setMinSal] = useState(searchParams.get('min_salary') || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    searchParams.get('skills') ? searchParams.get('skills')!.split(',') : []
  );

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (location) params.location = location;
      if (employmentType) params.employment_type = employmentType;
      if (workplaceType) params.workplace_type = workplaceType;
      if (minExp) params.min_experience = minExp;
      if (minSal) params.min_salary = minSal;
      if (selectedSkills.length > 0) params.skills = selectedSkills.join(',');

      const res = await api.get('/jobs/', { params });
      setJobs(res.data);
    } catch (_err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, skillRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/skills/'),
        ]);
        setCategories(catRes.data);
        setSkillsList(skillRes.data);
      } catch (_err) {
        // ignore
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  const applyFilters = () => {
    const params: any = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (location) params.location = location;
    if (employmentType) params.employment_type = employmentType;
    if (workplaceType) params.workplace_type = workplaceType;
    if (minExp) params.min_experience = minExp;
    if (minSal) params.min_salary = minSal;
    if (selectedSkills.length > 0) params.skills = selectedSkills.join(',');
    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setEmploymentType('');
    setWorkplaceType('');
    setMinExp('');
    setMinSal('');
    setSelectedSkills([]);
    setSearchParams({});
  };

  const toggleSkill = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Browse Positions at Markytics Consulting
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search published open jobs with PostgreSQL multi-field full-text search & skill filtering.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Showing <span className="font-bold text-indigo-600 dark:text-indigo-400">{jobs.length}</span> positions available
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-5 h-fit shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>Search Filters</span>
            </h3>
            <button
              onClick={resetFilters}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Reset All
            </button>
          </div>

          {/* Search Query */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Keyword Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Title, keyword, skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Job Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Job Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Location
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="City (e.g. Mumbai, Pune, Remote)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Employment Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Employment Type
            </label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="">All Types</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>

          {/* Workplace Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Workplace Type
            </label>
            <select
              value={workplaceType}
              onChange={(e) => setWorkplaceType(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="">All Workplace Types</option>
              <option value="ONSITE">Onsite</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </select>
          </div>

          {/* Required Skills (Multi-Select ALL Semantics) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Required Skills <span className="text-[10px] text-slate-400">(ALL match)</span>
            </label>
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-lg">
              {skillsList.map((sk) => {
                const isSelected = selectedSkills.includes(sk.name);
                return (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => toggleSkill(sk.name)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {sk.name}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={applyFilters}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
          >
            Apply Filters
          </button>
        </div>

        {/* Job Cards Stream */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Filtering jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Open Positions Match Your Filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try resetting your search terms, skill tags, or location parameters to view available opportunities.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 shadow-2xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      <span>{job.category_name || 'General Track'}</span>
                      <span>&middot;</span>
                      <span>{job.employment_type.replace('_', ' ')}</span>
                      <span>&middot;</span>
                      <span>{job.workplace_type}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      <Link to={`/jobs/${job.id}`} className="hover:text-indigo-600 transition-colors">
                        {job.title}
                      </Link>
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
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
                  </div>

                  <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded text-xs font-bold shrink-0 self-start">
                    OPEN
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="font-mono text-slate-900 dark:text-white font-semibold">
                      {job.salary_currency} {job.min_salary.toLocaleString()} - {job.max_salary.toLocaleString()}
                    </div>

                    <Link
                      to={`/jobs/${job.id}`}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1 shadow-xs"
                    >
                      <span>View Details & Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
