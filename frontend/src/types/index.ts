export type Role = 'ADMIN' | 'RECRUITER' | 'CANDIDATE';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  is_active: boolean;
  profile?: CandidateProfile | RecruiterProfile | null;
  created_at?: string;
  updated_at?: string;
}

export interface CandidateProfile {
  id: string;
  user_id: string;
  headline: string;
  bio: string;
  skills: string[];
  years_of_experience: number;
  location: string;
  portfolio_url?: string;
  linkedin_url?: string;
  search_visibility: 'PUBLIC' | 'PRIVATE';
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface RecruiterProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_description: string;
  company_website: string;
  location: string;
}

export interface JobCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Skill {
  id: string;
  name: string;
}

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type WorkplaceType = 'ONSITE' | 'HYBRID' | 'REMOTE';
export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED';

export interface Job {
  id: string;
  recruiter_id: string;
  recruiter_name?: string;
  company_name?: string;
  company_description?: string;
  title: string;
  description: string;
  category_id: string;
  category_name?: string;
  skills: string[];
  location: string;
  employment_type: EmploymentType;
  workplace_type: WorkplaceType;
  min_experience: number;
  max_experience: number;
  min_salary: number;
  max_salary: number;
  salary_currency: string;
  salary_period: 'ANNUAL' | 'MONTHLY';
  application_deadline?: string;
  status: JobStatus;
  published_at?: string;
  created_at: string;
  updated_at: string;
  applications_count?: number;
  existing_application?: Application | null;
}

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'REJECTED' | 'HIRED';

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  previous_status: string;
  new_status: ApplicationStatus;
  actor_id: string;
  actor_name: string;
  candidate_message?: string;
  timestamp: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  resume_filename: string;
  original_resume_name: string;
  cover_letter?: string;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
  candidate_name?: string;
  candidate_email?: string;
  candidate_profile?: CandidateProfile | null;
  job_title?: string;
  company_name?: string;
  job_location?: string;
  employment_type?: string;
  history?: ApplicationStatusHistory[];
}

export interface EmailNotification {
  id: string;
  event_ref: string;
  recipient_email: string;
  subject: string;
  template_id: string;
  render_data: {
    candidate_name?: string;
    job_title?: string;
    company_name?: string;
    previous_status?: string;
    new_status?: string;
    candidate_message?: string;
    name?: string;
    reset_link?: string;
  };
  delivery_state: 'PENDING' | 'SENT' | 'FAILED';
  attempt_count: number;
  last_error?: string;
  sent_at?: string;
  created_at: string;
}

export interface CandidateMetrics {
  total_applications: number;
  status_counts: Record<ApplicationStatus, number>;
  recent_activity: Application[];
}

export interface RecruiterMetrics {
  open_jobs_count: number;
  total_applications: number;
  shortlisted_count: number;
  interview_count: number;
  hired_count: number;
  status_counts: Record<ApplicationStatus, number>;
  recent_applicants: Application[];
}

export interface AdminMetrics {
  total_users: number;
  users_by_role: Record<Role, number>;
  total_jobs_posted: number;
  open_jobs_count: number;
  total_applications: number;
  successful_hires: number;
  outbox_count: number;
}
