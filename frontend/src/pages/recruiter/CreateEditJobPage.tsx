import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { JobCategory, Skill, EmploymentType, WorkplaceType, JobStatus } from '../../types';
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export const CreateEditJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [skillsList, setSkillsList] = useState<Skill[]>([]);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('FULL_TIME');
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>('HYBRID');
  const [minExperience, setMinExperience] = useState<number>(0);
  const [maxExperience, setMaxExperience] = useState<number>(2);
  const [minSalary, setMinSalary] = useState<number>(300000);
  const [maxSalary, setMaxSalary] = useState<number>(600000);
  const [salaryCurrency, setSalaryCurrency] = useState('INR');
  const [salaryPeriod, setSalaryPeriod] = useState<'ANNUAL' | 'MONTHLY'>('ANNUAL');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [status, setStatus] = useState<JobStatus>('OPEN');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      setLoading(true);
      try {
        const [catRes, skillRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/skills/'),
        ]);
        setCategories(catRes.data);
        setSkillsList(skillRes.data);
        if (catRes.data.length > 0 && !categoryId) {
          setCategoryId(catRes.data[0].id);
        }

        if (isEditing && id) {
          const jobRes = await api.get(`/jobs/${id}/`);
          const j = jobRes.data;
          setTitle(j.title);
          setDescription(j.description);
          setCategoryId(j.category_id);
          setSkillsText(j.skills ? j.skills.join(', ') : '');
          setLocation(j.location);
          setEmploymentType(j.employment_type);
          setWorkplaceType(j.workplace_type);
          setMinExperience(j.min_experience);
          setMaxExperience(j.max_experience);
          setMinSalary(j.min_salary);
          setMaxSalary(j.max_salary);
          setSalaryCurrency(j.salary_currency);
          setSalaryPeriod(j.salary_period);
          if (j.application_deadline) {
            setApplicationDeadline(j.application_deadline.split('T')[0]);
          }
          setStatus(j.status);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation checks
    if (minExperience < 0 || maxExperience < 0) {
      setError('Experience requirements cannot be negative.');
      return;
    }
    if (minExperience > maxExperience) {
      setError('Minimum experience cannot exceed maximum experience.');
      return;
    }
    if (minSalary < 0 || maxSalary < 0) {
      setError('Salary figures cannot be negative.');
      return;
    }
    if (minSalary > maxSalary) {
      setError('Minimum salary cannot exceed maximum salary.');
      return;
    }

    setSaving(true);
    try {
      const skillsArray = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload = {
        title,
        description,
        category_id: categoryId,
        skills: skillsArray,
        location,
        employment_type: employmentType,
        workplace_type: workplaceType,
        min_experience: Number(minExperience),
        max_experience: Number(maxExperience),
        min_salary: Number(minSalary),
        max_salary: Number(maxSalary),
        salary_currency: salaryCurrency,
        salary_period: salaryPeriod,
        application_deadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null,
        status,
      };

      if (isEditing && id) {
        await api.put(`/jobs/${id}/`, payload);
      } else {
        await api.post('/jobs/', payload);
      }

      navigate('/recruiter/jobs');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-12 text-center text-xs text-slate-400">Loading form...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/recruiter/jobs" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Jobs</span>
      </Link>

      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {isEditing ? 'Edit Job Opening' : 'Publish New Job Opening'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Specify role requirements, experience parameters, compensation band, and application deadline.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 text-xs">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Data Analyst Intern"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Posting Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="OPEN">OPEN (Published - Accepting Applications)</option>
              <option value="DRAFT">DRAFT (Saved internally - Not visible to candidates)</option>
              <option value="CLOSED">CLOSED (Visible in archives - No new applications)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            Job Description & Key Responsibilities <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={5}
            required
            placeholder="Detailed description of the internship or full-time position at Markytics..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        {/* Skills */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            Required Technical Skills (Comma-separated)
          </label>
          <input
            type="text"
            placeholder="Python, SQL, Django, React, Docker"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        {/* Location, Employment Type & Workplace Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Mumbai, India"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as any)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="INTERNSHIP">INTERNSHIP</option>
              <option value="FULL_TIME">FULL TIME</option>
              <option value="PART_TIME">PART TIME</option>
              <option value="CONTRACT">CONTRACT</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Workplace Type</label>
            <select
              value={workplaceType}
              onChange={(e) => setWorkplaceType(e.target.value as any)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="HYBRID">HYBRID</option>
              <option value="ONSITE">ONSITE</option>
              <option value="REMOTE">REMOTE</option>
            </select>
          </div>
        </div>

        {/* Experience Bounds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Minimum Experience (Years)</label>
            <input
              type="number"
              min={0}
              max={30}
              value={minExperience}
              onChange={(e) => setMinExperience(Number(e.target.value))}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Maximum Experience (Years)</label>
            <input
              type="number"
              min={0}
              max={30}
              value={maxExperience}
              onChange={(e) => setMaxExperience(Number(e.target.value))}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Salary Band */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Min Salary</label>
            <input
              type="number"
              min={0}
              value={minSalary}
              onChange={(e) => setMinSalary(Number(e.target.value))}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Max Salary</label>
            <input
              type="number"
              min={0}
              value={maxSalary}
              onChange={(e) => setMaxSalary(Number(e.target.value))}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Currency</label>
            <input
              type="text"
              value={salaryCurrency}
              onChange={(e) => setSalaryCurrency(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono uppercase focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Salary Cadence</label>
            <select
              value={salaryPeriod}
              onChange={(e) => setSalaryPeriod(e.target.value as any)}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="ANNUAL">Annual</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
        </div>

        {/* Deadline */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            Application Deadline (Timezone Aware)
          </label>
          <input
            type="date"
            value={applicationDeadline}
            onChange={(e) => setApplicationDeadline(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-hidden"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <Link
            to="/recruiter/jobs"
            className="px-4 py-2.5 text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Job Post...' : isEditing ? 'Update Job Post' : 'Publish Job Opening'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
