import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CandidateProfile } from '../../types';
import { User, CheckCircle2, Globe, Linkedin, Shield, Save, AlertCircle } from 'lucide-react';

export const CandidateProfilePage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [location, setLocation] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [searchVisibility, setSearchVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profiles/candidate/');
      const p = res.data;
      setProfile(p);
      setHeadline(p.headline || '');
      setBio(p.bio || '');
      setSkillsText(p.skills ? p.skills.join(', ') : '');
      setYearsOfExperience(p.years_of_experience || 0);
      setLocation(p.location || '');
      setPortfolioUrl(p.portfolio_url || '');
      setLinkedinUrl(p.linkedin_url || '');
      setSearchVisibility(p.search_visibility || 'PRIVATE');
    } catch (_err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const skillsArray = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await api.put('/profiles/candidate/', {
        headline,
        bio,
        skills: skillsArray,
        years_of_experience: Number(yearsOfExperience),
        location,
        portfolio_url: portfolioUrl,
        linkedin_url: linkedinUrl,
        search_visibility: searchVisibility,
      });

      setSuccess(true);
      refreshUser();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-12 text-center text-xs text-slate-400">Loading candidate profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Candidate Profile Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your skills, experience summary, portfolio links, and recruiter search visibility.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Profile updated successfully! Recruiter search tags updated.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-700 dark:text-red-300 rounded-xl text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 text-xs">
        {/* Search Visibility Setting */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-900 dark:text-white">Talent Search Visibility</span>
            </div>
            <select
              value={searchVisibility}
              onChange={(e) => setSearchVisibility(e.target.value as any)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="PRIVATE">PRIVATE (Default - Only visible to job recruiters you apply to)</option>
              <option value="PUBLIC">PUBLIC (Searchable in broader recruiter talent directory)</option>
            </select>
          </div>
          <p className="text-[11px] text-slate-500">
            By default, your profile and resume are strictly private and visible ONLY to recruiters owning jobs you applied to. Marking PUBLIC allows recruiters to discover your profile during broader talent search.
          </p>
        </div>

        {/* Professional Headline */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300">Professional Headline</label>
          <input
            type="text"
            placeholder="e.g. Data Analytics Intern & Full-Stack Developer"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300">Bio & Executive Summary</label>
          <textarea
            rows={4}
            placeholder="Summarize your academic background, projects, and career goals at Markytics..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        {/* Skills & Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Skills (Comma-separated)</label>
            <input
              type="text"
              placeholder="Python, React, SQL, Django, Power BI"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Years of Experience</label>
            <input
              type="number"
              min={0}
              max={30}
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(Number(e.target.value))}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Location & Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Current Location</label>
            <input
              type="text"
              placeholder="Mumbai, India"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Portfolio URL</label>
            <input
              type="url"
              placeholder="https://myportfolio.dev"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">LinkedIn Profile</label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/my-profile"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
