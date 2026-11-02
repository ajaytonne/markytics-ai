import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for PDF resumes
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for resume upload.'));
    }
  },
});

// Types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'RECRUITER' | 'CANDIDATE';
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

export interface Job {
  id: string;
  recruiter_id: string;
  recruiter_name?: string;
  company_name?: string;
  title: string;
  description: string;
  category_id: string;
  category_name?: string;
  skills: string[];
  location: string;
  employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  workplace_type: 'ONSITE' | 'HYBRID' | 'REMOTE';
  min_experience: number;
  max_experience: number;
  min_salary: number;
  max_salary: number;
  salary_currency: string;
  salary_period: 'ANNUAL' | 'MONTHLY';
  application_deadline?: string;
  status: 'DRAFT' | 'OPEN' | 'CLOSED';
  published_at?: string;
  created_at: string;
  updated_at: string;
  applications_count?: number;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  resume_filename: string;
  original_resume_name: string;
  cover_letter?: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'REJECTED' | 'HIRED';
  applied_at: string;
  updated_at: string;
  candidate_name?: string;
  candidate_email?: string;
  job_title?: string;
  company_name?: string;
}

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  previous_status: string;
  new_status: string;
  actor_id: string;
  actor_name: string;
  candidate_message?: string;
  timestamp: string;
}

export interface EmailNotification {
  id: string;
  event_ref: string;
  recipient_email: string;
  subject: string;
  template_id: string;
  render_data: any;
  delivery_state: 'PENDING' | 'SENT' | 'FAILED';
  attempt_count: number;
  last_error?: string;
  sent_at?: string;
  created_at: string;
}

export interface PasswordResetToken {
  token_hash: string;
  user_id: string;
  expires_at: number; // timestamp in ms
}

// Pre-hash default demo password "Demo@1234"
const defaultDemoPasswordHash = bcrypt.hashSync('Demo@1234', 10);

// In-Memory Database Store
const users: User[] = [
  {
    id: 'u-admin-1',
    email: 'admin@markytics.com',
    password_hash: defaultDemoPasswordHash,
    first_name: 'System',
    last_name: 'Administrator',
    role: 'ADMIN',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'u-recruiter-1',
    email: 'hr@markytics.com',
    password_hash: defaultDemoPasswordHash,
    first_name: 'Ananya',
    last_name: 'Sharma',
    role: 'RECRUITER',
    is_active: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'u-recruiter-2',
    email: 'techleads@markytics.com',
    password_hash: defaultDemoPasswordHash,
    first_name: 'Vikram',
    last_name: 'Mehta',
    role: 'RECRUITER',
    is_active: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'u-candidate-1',
    email: 'candidate@example.com',
    password_hash: defaultDemoPasswordHash,
    first_name: 'Rohan',
    last_name: 'Deshmukh',
    role: 'CANDIDATE',
    is_active: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'u-candidate-2',
    email: 'priya.patel@example.com',
    password_hash: defaultDemoPasswordHash,
    first_name: 'Priya',
    last_name: 'Patel',
    role: 'CANDIDATE',
    is_active: true,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

const candidateProfiles: CandidateProfile[] = [
  {
    id: 'cp-1',
    user_id: 'u-candidate-1',
    headline: 'Data Analytics & Full-Stack Development Intern',
    bio: 'Enthusiastic Computer Science undergraduate skilled in Data Analysis, Python, React, and SQL. Looking for intern and entry-level consulting roles at Markytics.',
    skills: ['Python', 'React', 'SQL', 'Data Analytics', 'Power BI'],
    years_of_experience: 1,
    location: 'Mumbai, India',
    portfolio_url: 'https://rohandeshmukh.dev',
    linkedin_url: 'https://linkedin.com/in/rohan-deshmukh-demo',
    search_visibility: 'PUBLIC',
  },
  {
    id: 'cp-2',
    user_id: 'u-candidate-2',
    headline: 'AI & Machine Learning Researcher',
    bio: 'Master student specializing in NLP and Machine Learning workflows. Eager to solve real-world predictive modeling challenges.',
    skills: ['Python', 'Machine Learning', 'PyTorch', 'Django', 'NLP'],
    years_of_experience: 2,
    location: 'Pune, India',
    portfolio_url: 'https://priyapatel.ai',
    linkedin_url: 'https://linkedin.com/in/priya-patel-ai',
    search_visibility: 'PUBLIC',
  },
];

const recruiterProfiles: RecruiterProfile[] = [
  {
    id: 'rp-1',
    user_id: 'u-recruiter-1',
    company_name: 'Markytics Consulting Pvt Ltd',
    company_description: 'Premier Data Analytics, AI Consulting, and Digital Transformation Solutions provider for Global Enterprises.',
    company_website: 'https://markytics.com',
    location: 'Mumbai / Pune, India',
  },
  {
    id: 'rp-2',
    user_id: 'u-recruiter-2',
    company_name: 'Markytics Tech Labs',
    company_description: 'Innovation Hub at Markytics developing cutting-edge AI and SaaS products.',
    company_website: 'https://markytics.com/labs',
    location: 'Pune, India',
  },
];

const categories: JobCategory[] = [
  { id: 'cat-1', name: 'Data & Analytics', slug: 'data-analytics' },
  { id: 'cat-2', name: 'Software Engineering', slug: 'software-engineering' },
  { id: 'cat-3', name: 'AI & Machine Learning', slug: 'ai-ml' },
  { id: 'cat-4', name: 'Business Consulting', slug: 'business-consulting' },
];

const skillsList: Skill[] = [
  { id: 'sk-1', name: 'Python' },
  { id: 'sk-2', name: 'Django' },
  { id: 'sk-3', name: 'React' },
  { id: 'sk-4', name: 'SQL' },
  { id: 'sk-5', name: 'PostgreSQL' },
  { id: 'sk-6', name: 'Machine Learning' },
  { id: 'sk-7', name: 'Data Analytics' },
  { id: 'sk-8', name: 'Docker' },
  { id: 'sk-9', name: 'TypeScript' },
  { id: 'sk-10', name: 'Power BI' },
];

const jobs: Job[] = [
  {
    id: 'job-1',
    recruiter_id: 'u-recruiter-1',
    title: 'Data Analyst Intern',
    description: 'Markytics Consulting is looking for a Data Analyst Intern to perform data extraction, modeling, and dashboard creation using SQL, Python, and Power BI.',
    category_id: 'cat-1',
    skills: ['Python', 'SQL', 'Data Analytics', 'Power BI'],
    location: 'Mumbai (Hybrid)',
    employment_type: 'INTERNSHIP',
    workplace_type: 'HYBRID',
    min_experience: 0,
    max_experience: 2,
    min_salary: 25000,
    max_salary: 40000,
    salary_currency: 'INR',
    salary_period: 'MONTHLY',
    application_deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
    status: 'OPEN',
    published_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'job-2',
    recruiter_id: 'u-recruiter-1',
    title: 'Full-Stack Software Engineer (Python/Django & React)',
    description: 'Join our digital transformation team building enterprise web portals and APIs using Django REST Framework, React, PostgreSQL, and Docker.',
    category_id: 'cat-2',
    skills: ['Python', 'Django', 'React', 'PostgreSQL', 'Docker'],
    location: 'Pune (Onsite)',
    employment_type: 'FULL_TIME',
    workplace_type: 'ONSITE',
    min_experience: 1,
    max_experience: 3,
    min_salary: 600000,
    max_salary: 1000000,
    salary_currency: 'INR',
    salary_period: 'ANNUAL',
    application_deadline: new Date(Date.now() + 45 * 86400000).toISOString(),
    status: 'OPEN',
    published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'job-3',
    recruiter_id: 'u-recruiter-2',
    title: 'Junior Machine Learning Engineer',
    description: 'Develop predictive models, fine-tune LLMs, and deploy machine learning pipelines for retail analytics and financial risk assessment.',
    category_id: 'cat-3',
    skills: ['Python', 'Machine Learning', 'SQL', 'PostgreSQL'],
    location: 'Remote',
    employment_type: 'FULL_TIME',
    workplace_type: 'REMOTE',
    min_experience: 1,
    max_experience: 4,
    min_salary: 800000,
    max_salary: 1400000,
    salary_currency: 'INR',
    salary_period: 'ANNUAL',
    application_deadline: new Date(Date.now() + 20 * 86400000).toISOString(),
    status: 'OPEN',
    published_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'job-4',
    recruiter_id: 'u-recruiter-1',
    title: 'Business Consulting Intern (Draft)',
    description: 'Assist senior consultants in market research, financial modeling, and client presentation decks.',
    category_id: 'cat-4',
    skills: ['Data Analytics', 'SQL'],
    location: 'Mumbai',
    employment_type: 'INTERNSHIP',
    workplace_type: 'HYBRID',
    min_experience: 0,
    max_experience: 1,
    min_salary: 20000,
    max_salary: 30000,
    salary_currency: 'INR',
    salary_period: 'MONTHLY',
    status: 'DRAFT',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// Sample PDF file
const samplePdfPath = path.join(uploadDir, 'sample-resume.pdf');
if (!fs.existsSync(samplePdfPath)) {
  const dummyPdfHeader = `%PDF-1.4
%âãÏÓ
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 85 >>
stream
BT
/F1 18 Tf
100 700 TD
(Markytics Intern Candidate Resume - Rohan Deshmukh) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000064 00000 n 
0000000121 00000 n 
0000000249 00000 n 
0000000384 00000 n 
trailer
<< /Root 1 0 R /Size 6 >>
startxref
453
%%EOF`;
  fs.writeFileSync(samplePdfPath, dummyPdfHeader);
}

const applications: Application[] = [
  {
    id: 'app-1',
    job_id: 'job-1',
    candidate_id: 'u-candidate-1',
    resume_filename: 'sample-resume.pdf',
    original_resume_name: 'Rohan_Deshmukh_Resume.pdf',
    cover_letter: 'I am excited to apply for the Data Analyst Intern position at Markytics. I have strong experience in Python, SQL, and data visualization.',
    status: 'SHORTLISTED',
    applied_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'app-2',
    job_id: 'job-2',
    candidate_id: 'u-candidate-1',
    resume_filename: 'sample-resume.pdf',
    original_resume_name: 'Rohan_Deshmukh_Resume.pdf',
    cover_letter: 'Applying for the Full-Stack Software Engineer role. I built Django REST backend and React applications.',
    status: 'APPLIED',
    applied_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'app-3',
    job_id: 'job-3',
    candidate_id: 'u-candidate-2',
    resume_filename: 'sample-resume.pdf',
    original_resume_name: 'Priya_Patel_ML_Resume.pdf',
    cover_letter: 'Dear Hiring Manager, I am applying for the ML Engineer role. My focus is on predictive analytics and Django microservices.',
    status: 'INTERVIEW',
    applied_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const statusHistories: ApplicationStatusHistory[] = [
  {
    id: 'ash-1',
    application_id: 'app-1',
    previous_status: 'APPLIED',
    new_status: 'SHORTLISTED',
    actor_id: 'u-recruiter-1',
    actor_name: 'Ananya Sharma (Recruiter)',
    candidate_message: 'Your profile matches our requirements for Data Analytics. We have shortlisted you for technical evaluation.',
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'ash-2',
    application_id: 'app-3',
    previous_status: 'APPLIED',
    new_status: 'SHORTLISTED',
    actor_id: 'u-recruiter-2',
    actor_name: 'Vikram Mehta (Recruiter)',
    candidate_message: 'Great resume! Moving to shortlist.',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'ash-3',
    application_id: 'app-3',
    previous_status: 'SHORTLISTED',
    new_status: 'INTERVIEW',
    actor_id: 'u-recruiter-2',
    actor_name: 'Vikram Mehta (Recruiter)',
    candidate_message: 'We would like to invite you for a 45-minute technical interview with our Lead Data Scientist.',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const emailOutbox: EmailNotification[] = [
  {
    id: 'outbox-1',
    event_ref: 'app-1:SHORTLISTED',
    recipient_email: 'candidate@example.com',
    subject: 'Application Status Updated: SHORTLISTED for Data Analyst Intern at Markytics Consulting',
    template_id: 'STATUS_CHANGE_NOTIFICATION',
    render_data: {
      candidate_name: 'Rohan Deshmukh',
      job_title: 'Data Analyst Intern',
      company_name: 'Markytics Consulting Pvt Ltd',
      previous_status: 'APPLIED',
      new_status: 'SHORTLISTED',
      candidate_message: 'Your profile matches our requirements for Data Analytics.',
    },
    delivery_state: 'SENT',
    attempt_count: 1,
    sent_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'outbox-2',
    event_ref: 'app-3:INTERVIEW',
    recipient_email: 'priya.patel@example.com',
    subject: 'Interview Invitation: Junior Machine Learning Engineer at Markytics Tech Labs',
    template_id: 'STATUS_CHANGE_NOTIFICATION',
    render_data: {
      candidate_name: 'Priya Patel',
      job_title: 'Junior Machine Learning Engineer',
      company_name: 'Markytics Tech Labs',
      previous_status: 'SHORTLISTED',
      new_status: 'INTERVIEW',
      candidate_message: 'We would like to invite you for a 45-minute technical interview.',
    },
    delivery_state: 'SENT',
    attempt_count: 1,
    sent_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// In-Memory Password Reset Tokens (single-use, 1 hour expiry)
const passwordResetTokens: PasswordResetToken[] = [];

// Active Sessions Store
const activeSessions: Record<string, string> = {};

// Helper to generate a random 32-byte hex session ID
const generateSessionId = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

const getAuthenticatedUser = (req: Request): User | null => {
  const sessionId = req.cookies?.sessionid || req.headers['x-session-id'];
  if (!sessionId || !activeSessions[sessionId as string]) {
    return null;
  }
  const userId = activeSessions[sessionId as string];
  const user = users.find((u) => u.id === userId && u.is_active);
  return user || null;
};

// Express App Initialization
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CSRF Middleware & Header Initialization
app.use((req: Request, res: Response, next: NextFunction) => {
  let csrfToken = req.cookies['csrftoken'];
  if (!csrfToken) {
    csrfToken = 'csrf-' + crypto.randomBytes(16).toString('hex');
    res.cookie('csrftoken', csrfToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }
  res.setHeader('X-CSRFToken', csrfToken);
  next();
});

// Helper response functions
const successResponse = (res: Response, data: any, status = 200) => {
  return res.status(status).json(data);
};

const errorResponse = (res: Response, message: string, status = 400, errors?: any) => {
  return res.status(status).json({ detail: message, errors });
};

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Health Check Endpoint
app.get('/api/v1/health/', (_req: Request, res: Response) => {
  return res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
});

// 1. Initialize CSRF Token
app.get('/api/v1/auth/csrf/', (_req: Request, res: Response) => {
  const csrfToken = res.getHeader('X-CSRFToken') || 'csrf-token';
  return res.json({ detail: 'CSRF cookie set', csrfToken });
});

// 2. Current User
app.get('/api/v1/auth/me/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return errorResponse(res, 'Authentication credentials were not provided.', 401);
  }

  let profile: any = null;
  if (user.role === 'CANDIDATE') {
    profile = candidateProfiles.find((cp) => cp.user_id === user.id) || null;
  } else if (user.role === 'RECRUITER') {
    profile = recruiterProfiles.find((rp) => rp.user_id === user.id) || null;
  }

  return successResponse(res, {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    is_active: user.is_active,
    profile,
  });
});

// 3. Register Endpoint (Candidates & Recruiters ONLY)
app.post('/api/v1/auth/register/', (req: Request, res: Response) => {
  const { email, password, first_name, last_name, role } = req.body;

  if (!email || !password || !first_name || !last_name || !role) {
    return errorResponse(res, 'All required fields (email, password, first_name, last_name, role) must be provided.');
  }

  if (typeof password !== 'string' || password.length < 8) {
    return errorResponse(res, 'Password must be at least 8 characters long.', 400);
  }

  if (role !== 'CANDIDATE' && role !== 'RECRUITER') {
    return errorResponse(res, 'Invalid role choice. Public registration allows CANDIDATE or RECRUITER only.', 400);
  }

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return errorResponse(res, 'A user with this email address already exists.', 400);
  }

  const password_hash = bcrypt.hashSync(password, 10);

  const newUser: User = {
    id: 'u-' + Date.now(),
    email: email.toLowerCase(),
    password_hash,
    first_name,
    last_name,
    role,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  users.push(newUser);

  if (role === 'CANDIDATE') {
    candidateProfiles.push({
      id: 'cp-' + Date.now(),
      user_id: newUser.id,
      headline: '',
      bio: '',
      skills: [],
      years_of_experience: 0,
      location: '',
      search_visibility: 'PRIVATE',
    });
  } else if (role === 'RECRUITER') {
    recruiterProfiles.push({
      id: 'rp-' + Date.now(),
      user_id: newUser.id,
      company_name: 'Markytics Partner Enterprise',
      company_description: 'Consulting client partner',
      company_website: '',
      location: '',
    });
  }

  const sessionId = generateSessionId();
  activeSessions[sessionId] = newUser.id;

  res.cookie('sessionid', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return successResponse(
    res,
    {
      detail: 'Registration successful.',
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
      },
      sessionId,
    },
    201
  );
});

// 4. Login Endpoint
app.post('/api/v1/auth/login/', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 'Email and password are required.', 400);
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !user.is_active) {
    return errorResponse(res, 'Invalid email or password.', 401);
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return errorResponse(res, 'Invalid email or password.', 401);
  }

  const sessionId = generateSessionId();
  activeSessions[sessionId] = user.id;

  res.cookie('sessionid', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return successResponse(res, {
    detail: 'Login successful.',
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    },
    sessionId,
  });
});

// 5. Logout Endpoint
app.post('/api/v1/auth/logout/', (req: Request, res: Response) => {
  const sessionId = req.cookies?.sessionid || req.headers['x-session-id'];
  if (sessionId && activeSessions[sessionId as string]) {
    delete activeSessions[sessionId as string];
  }
  res.clearCookie('sessionid', { path: '/' });
  return successResponse(res, { detail: 'Logged out successfully.' });
});

// 6. Password Reset Request (Single-use random token, 1-hour expiry, non-revealing response)
app.post('/api/v1/auth/password-reset/', (req: Request, res: Response) => {
  const { email } = req.body;
  if (email) {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      const rawToken = crypto.randomBytes(24).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

      passwordResetTokens.push({
        token_hash: tokenHash,
        user_id: user.id,
        expires_at: expiresAt,
      });

      emailOutbox.push({
        id: 'outbox-' + Date.now(),
        event_ref: 'password-reset:' + user.id,
        recipient_email: user.email,
        subject: 'Password Reset Request - Markytics Job Portal',
        template_id: 'PASSWORD_RESET',
        render_data: {
          name: `${user.first_name} ${user.last_name}`,
          reset_link: `${req.protocol}://${req.get('host')}/reset-password?token=${rawToken}`,
        },
        delivery_state: 'SENT',
        attempt_count: 1,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    }
  }

  return successResponse(res, {
    detail: 'If an account exists with this email address, a password reset link has been dispatched to your email outbox.',
  });
});

// 7. Password Reset Confirmation (Single-use token verification & 8+ character password rule)
app.post('/api/v1/auth/password-reset-confirm/', (req: Request, res: Response) => {
  const { token, new_password } = req.body;

  if (!token || !new_password) {
    return errorResponse(res, 'Reset token and new password are required.', 400);
  }

  if (typeof new_password !== 'string' || new_password.length < 8) {
    return errorResponse(res, 'New password must be at least 8 characters long.', 400);
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const tokenIdx = passwordResetTokens.findIndex(
    (t) => t.token_hash === tokenHash && t.expires_at > Date.now()
  );

  if (tokenIdx === -1) {
    return errorResponse(res, 'Invalid or expired password reset token.', 400);
  }

  const tokenObj = passwordResetTokens[tokenIdx];
  const userIdx = users.findIndex((u) => u.id === tokenObj.user_id);

  if (userIdx !== -1) {
    users[userIdx].password_hash = bcrypt.hashSync(new_password, 10);
    users[userIdx].updated_at = new Date().toISOString();
  }

  // Token is single-use, delete it after use
  passwordResetTokens.splice(tokenIdx, 1);

  return successResponse(res, { detail: 'Password has been successfully updated.' });
});

// ==========================================
// PROFILES & CANDIDATE SEARCH
// ==========================================

app.get('/api/v1/profiles/candidate/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'CANDIDATE') {
    return errorResponse(res, 'Authentication required as a Candidate.', 403);
  }
  let profile = candidateProfiles.find((cp) => cp.user_id === user.id);
  if (!profile) {
    profile = {
      id: 'cp-' + Date.now(),
      user_id: user.id,
      headline: '',
      bio: '',
      skills: [],
      years_of_experience: 0,
      location: '',
      search_visibility: 'PRIVATE',
    };
    candidateProfiles.push(profile);
  }
  return successResponse(res, profile);
});

app.put('/api/v1/profiles/candidate/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'CANDIDATE') {
    return errorResponse(res, 'Authentication required as a Candidate.', 403);
  }
  const idx = candidateProfiles.findIndex((cp) => cp.user_id === user.id);
  if (idx === -1) {
    return errorResponse(res, 'Profile not found.', 404);
  }

  const { headline, bio, skills, years_of_experience, location, portfolio_url, linkedin_url, search_visibility } = req.body;

  candidateProfiles[idx] = {
    ...candidateProfiles[idx],
    headline: headline !== undefined ? headline : candidateProfiles[idx].headline,
    bio: bio !== undefined ? bio : candidateProfiles[idx].bio,
    skills: Array.isArray(skills) ? skills : candidateProfiles[idx].skills,
    years_of_experience: typeof years_of_experience === 'number' ? Math.max(0, years_of_experience) : candidateProfiles[idx].years_of_experience,
    location: location !== undefined ? location : candidateProfiles[idx].location,
    portfolio_url,
    linkedin_url,
    search_visibility: search_visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
  };

  return successResponse(res, candidateProfiles[idx]);
});

app.get('/api/v1/profiles/recruiter/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'RECRUITER') {
    return errorResponse(res, 'Authentication required as a Recruiter.', 403);
  }
  let profile = recruiterProfiles.find((rp) => rp.user_id === user.id);
  if (!profile) {
    profile = {
      id: 'rp-' + Date.now(),
      user_id: user.id,
      company_name: 'Markytics Consulting Pvt Ltd',
      company_description: 'Data Analytics and AI Solutions',
      company_website: 'https://markytics.com',
      location: 'Mumbai, India',
    };
    recruiterProfiles.push(profile);
  }
  return successResponse(res, profile);
});

app.put('/api/v1/profiles/recruiter/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'RECRUITER') {
    return errorResponse(res, 'Authentication required as a Recruiter.', 403);
  }
  const idx = recruiterProfiles.findIndex((rp) => rp.user_id === user.id);
  if (idx === -1) {
    return errorResponse(res, 'Recruiter profile not found.', 404);
  }
  const { company_name, company_description, company_website, location } = req.body;
  recruiterProfiles[idx] = {
    ...recruiterProfiles[idx],
    company_name: company_name || recruiterProfiles[idx].company_name,
    company_description: company_description || recruiterProfiles[idx].company_description,
    company_website: company_website || recruiterProfiles[idx].company_website,
    location: location || recruiterProfiles[idx].location,
  };
  return successResponse(res, recruiterProfiles[idx]);
});

app.get('/api/v1/candidates/search/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || (user.role !== 'RECRUITER' && user.role !== 'ADMIN')) {
    return errorResponse(res, 'Only recruiters and administrators can search candidate profiles.', 403);
  }

  const { query, skill, min_exp } = req.query;

  let ownedJobIds: string[] = [];
  if (user.role === 'RECRUITER') {
    ownedJobIds = jobs.filter((j) => j.recruiter_id === user.id).map((j) => j.id);
  }
  const applicantCandidateIds = applications.filter((app) => ownedJobIds.includes(app.job_id)).map((app) => app.candidate_id);

  const visibleProfiles = candidateProfiles.filter((cp) => {
    if (user.role === 'ADMIN') return true;
    if (cp.search_visibility === 'PUBLIC') return true;
    if (applicantCandidateIds.includes(cp.user_id)) return true;
    return false;
  });

  let results = visibleProfiles.map((cp) => {
    const candidateUser = users.find((u) => u.id === cp.user_id);
    return {
      ...cp,
      first_name: candidateUser?.first_name || 'Candidate',
      last_name: candidateUser?.last_name || '',
      email: candidateUser?.email || '',
    };
  });

  if (query) {
    const q = (query as string).toLowerCase();
    results = results.filter(
      (c) =>
        c.headline.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (skill) {
    const s = (skill as string).toLowerCase();
    results = results.filter((c) => c.skills.some((sk) => sk.toLowerCase().includes(s)));
  }

  if (min_exp) {
    const exp = parseInt(min_exp as string, 10);
    if (!isNaN(exp)) {
      results = results.filter((c) => c.years_of_experience >= exp);
    }
  }

  return successResponse(res, results);
});

// ==========================================
// JOBS & CATEGORIES & SKILLS
// ==========================================

app.get('/api/v1/categories/', (_req: Request, res: Response) => {
  return successResponse(res, categories);
});

app.get('/api/v1/skills/', (_req: Request, res: Response) => {
  return successResponse(res, skillsList);
});

app.get('/api/v1/jobs/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const { search, category, location, skills, min_experience, max_experience, min_salary, max_salary, employment_type, workplace_type, scope } = req.query;

  let jobList = [...jobs];

  if (scope === 'owned' && user && user.role === 'RECRUITER') {
    jobList = jobList.filter((j) => j.recruiter_id === user.id);
  } else if (user && user.role === 'ADMIN' && scope === 'all') {
    // Admin sees all
  } else {
    const now = new Date();
    jobList = jobList.filter((j) => {
      if (j.status !== 'OPEN') return false;
      if (j.application_deadline) {
        const deadline = new Date(j.application_deadline);
        if (deadline < now) return false;
      }
      return true;
    });
  }

  if (search) {
    const q = (search as string).toLowerCase().trim();
    const searchTerms = q.split(/\s+/);
    jobList = jobList.filter((j) => {
      const textContent = `${j.title} ${j.description} ${j.skills.join(' ')} ${j.location}`.toLowerCase();
      return searchTerms.every((term) => textContent.includes(term));
    });
  }

  if (category) {
    jobList = jobList.filter((j) => j.category_id === category || j.category_name?.toLowerCase() === (category as string).toLowerCase());
  }

  if (location) {
    const loc = (location as string).toLowerCase();
    jobList = jobList.filter((j) => j.location.toLowerCase().includes(loc));
  }

  if (skills) {
    const requestedSkills = Array.isArray(skills) ? (skills as string[]) : (skills as string).split(',');
    jobList = jobList.filter((j) => requestedSkills.every((sk) => j.skills.map((s) => s.toLowerCase()).includes(sk.trim().toLowerCase())));
  }

  if (min_experience) {
    const exp = parseInt(min_experience as string, 10);
    if (!isNaN(exp)) {
      jobList = jobList.filter((j) => j.max_experience >= exp);
    }
  }

  if (max_experience) {
    const exp = parseInt(max_experience as string, 10);
    if (!isNaN(exp)) {
      jobList = jobList.filter((j) => j.min_experience <= exp);
    }
  }

  if (min_salary) {
    const sal = parseInt(min_salary as string, 10);
    if (!isNaN(sal)) {
      jobList = jobList.filter((j) => j.max_salary >= sal);
    }
  }

  if (employment_type) {
    jobList = jobList.filter((j) => j.employment_type === employment_type);
  }

  if (workplace_type) {
    jobList = jobList.filter((j) => j.workplace_type === workplace_type);
  }

  const enrichedList = jobList.map((j) => {
    const cat = categories.find((c) => c.id === j.category_id);
    const recUser = users.find((u) => u.id === j.recruiter_id);
    const recProf = recruiterProfiles.find((rp) => rp.user_id === j.recruiter_id);
    const appCount = applications.filter((app) => app.job_id === j.id).length;

    return {
      ...j,
      category_name: cat ? cat.name : 'General',
      recruiter_name: recUser ? `${recUser.first_name} ${recUser.last_name}` : 'Hiring Manager',
      company_name: recProf?.company_name || 'Markytics Consulting Pvt Ltd',
      applications_count: appCount,
    };
  });

  return successResponse(res, enrichedList);
});

app.get('/api/v1/jobs/:id/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const job = jobs.find((j) => j.id === req.params.id);
  if (!job) {
    return errorResponse(res, 'Job not found.', 404);
  }

  if (job.status === 'DRAFT') {
    if (!user || (user.role !== 'ADMIN' && user.id !== job.recruiter_id)) {
      return errorResponse(res, 'This job posting is in draft mode and not available publicly.', 403);
    }
  }

  const cat = categories.find((c) => c.id === job.category_id);
  const recUser = users.find((u) => u.id === job.recruiter_id);
  const recProf = recruiterProfiles.find((rp) => rp.user_id === job.recruiter_id);
  const appCount = applications.filter((app) => app.job_id === job.id).length;

  let existingApplication = null;
  if (user && user.role === 'CANDIDATE') {
    existingApplication = applications.find((app) => app.job_id === job.id && app.candidate_id === user.id) || null;
  }

  return successResponse(res, {
    ...job,
    category_name: cat ? cat.name : 'General',
    recruiter_name: recUser ? `${recUser.first_name} ${recUser.last_name}` : 'Hiring Manager',
    company_name: recProf?.company_name || 'Markytics Consulting Pvt Ltd',
    company_description: recProf?.company_description || '',
    applications_count: appCount,
    existing_application: existingApplication,
  });
});

app.post('/api/v1/jobs/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'RECRUITER') {
    return errorResponse(res, 'Only recruiters can post job openings.', 403);
  }

  const {
    title,
    description,
    category_id,
    skills,
    location,
    employment_type,
    workplace_type,
    min_experience,
    max_experience,
    min_salary,
    max_salary,
    salary_currency,
    salary_period,
    application_deadline,
    status,
  } = req.body;

  if (!title || !description || !category_id || !location) {
    return errorResponse(res, 'Title, description, category, and location are required.');
  }

  const minExp = Number(min_experience) || 0;
  const maxExp = Number(max_experience) || 0;
  if (minExp < 0 || maxExp < 0) {
    return errorResponse(res, 'Experience values cannot be negative.');
  }
  if (minExp > maxExp) {
    return errorResponse(res, 'Minimum experience cannot exceed maximum experience.');
  }

  const minSal = Number(min_salary) || 0;
  const maxSal = Number(max_salary) || 0;
  if (minSal < 0 || maxSal < 0) {
    return errorResponse(res, 'Salary values cannot be negative.');
  }
  if (minSal > maxSal) {
    return errorResponse(res, 'Minimum salary cannot exceed maximum salary.');
  }

  const newJob: Job = {
    id: 'job-' + Date.now(),
    recruiter_id: user.id,
    title,
    description,
    category_id,
    skills: Array.isArray(skills) ? skills : [],
    location,
    employment_type: employment_type || 'FULL_TIME',
    workplace_type: workplace_type || 'HYBRID',
    min_experience: minExp,
    max_experience: maxExp,
    min_salary: minSal,
    max_salary: maxSal,
    salary_currency: salary_currency || 'INR',
    salary_period: salary_period || 'ANNUAL',
    application_deadline: application_deadline || undefined,
    status: status === 'OPEN' ? 'OPEN' : 'DRAFT',
    published_at: status === 'OPEN' ? new Date().toISOString() : undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  jobs.push(newJob);
  return successResponse(res, newJob, 201);
});

app.put('/api/v1/jobs/:id/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const jobIdx = jobs.findIndex((j) => j.id === req.params.id);
  if (jobIdx === -1) {
    return errorResponse(res, 'Job not found.', 404);
  }

  const job = jobs[jobIdx];
  if (!user || (user.role !== 'ADMIN' && user.id !== job.recruiter_id)) {
    return errorResponse(res, 'You do not have permission to modify this job listing.', 403);
  }

  const {
    title,
    description,
    category_id,
    skills,
    location,
    employment_type,
    workplace_type,
    min_experience,
    max_experience,
    min_salary,
    max_salary,
    salary_currency,
    salary_period,
    application_deadline,
    status,
  } = req.body;

  const minExp = min_experience !== undefined ? Number(min_experience) : job.min_experience;
  const maxExp = max_experience !== undefined ? Number(max_experience) : job.max_experience;
  if (minExp > maxExp) {
    return errorResponse(res, 'Minimum experience cannot exceed maximum experience.');
  }

  const minSal = min_salary !== undefined ? Number(min_salary) : job.min_salary;
  const maxSal = max_salary !== undefined ? Number(max_salary) : job.max_salary;
  if (minSal > maxSal) {
    return errorResponse(res, 'Minimum salary cannot exceed maximum salary.');
  }

  let publishedAt = job.published_at;
  if (status === 'OPEN' && !publishedAt) {
    publishedAt = new Date().toISOString();
  }

  jobs[jobIdx] = {
    ...job,
    title: title || job.title,
    description: description || job.description,
    category_id: category_id || job.category_id,
    skills: Array.isArray(skills) ? skills : job.skills,
    location: location || job.location,
    employment_type: employment_type || job.employment_type,
    workplace_type: workplace_type || job.workplace_type,
    min_experience: minExp,
    max_experience: maxExp,
    min_salary: minSal,
    max_salary: maxSal,
    salary_currency: salary_currency || job.salary_currency,
    salary_period: salary_period || job.salary_period,
    application_deadline: application_deadline !== undefined ? application_deadline : job.application_deadline,
    status: status || job.status,
    published_at: publishedAt,
    updated_at: new Date().toISOString(),
  };

  return successResponse(res, jobs[jobIdx]);
});

app.post('/api/v1/jobs/:id/status/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const jobIdx = jobs.findIndex((j) => j.id === req.params.id);
  if (jobIdx === -1) {
    return errorResponse(res, 'Job not found.', 404);
  }

  const job = jobs[jobIdx];
  if (!user || (user.role !== 'ADMIN' && user.id !== job.recruiter_id)) {
    return errorResponse(res, 'You do not have permission to change this job status.', 403);
  }

  const { status } = req.body;
  if (status !== 'OPEN' && status !== 'CLOSED' && status !== 'DRAFT') {
    return errorResponse(res, 'Invalid status action. Must be OPEN, CLOSED, or DRAFT.');
  }

  let publishedAt = job.published_at;
  if (status === 'OPEN' && !publishedAt) {
    publishedAt = new Date().toISOString();
  }

  jobs[jobIdx].status = status;
  jobs[jobIdx].published_at = publishedAt;
  jobs[jobIdx].updated_at = new Date().toISOString();

  return successResponse(res, { detail: `Job status updated to ${status}.`, job: jobs[jobIdx] });
});

// ==========================================
// APPLICATIONS & STATUS WORKFLOW
// ==========================================

app.post('/api/v1/applications/', upload.single('resume'), (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'CANDIDATE') {
    return errorResponse(res, 'Only registered candidates can submit job applications.', 403);
  }

  const { job_id, cover_letter } = req.body;
  if (!job_id) {
    return errorResponse(res, 'Job ID is required.');
  }

  const job = jobs.find((j) => j.id === job_id);
  if (!job) {
    return errorResponse(res, 'Target job posting does not exist.', 404);
  }

  if (job.status !== 'OPEN') {
    return errorResponse(res, 'Applications are rejected because this job is currently closed or in draft status.', 400);
  }

  if (job.application_deadline) {
    const deadline = new Date(job.application_deadline);
    if (deadline < new Date()) {
      return errorResponse(res, 'Applications are rejected because the application deadline has passed.', 400);
    }
  }

  const existingApp = applications.find((app) => app.job_id === job_id && app.candidate_id === user.id);
  if (existingApp) {
    return errorResponse(res, 'You have already submitted an application for this job posting.', 400);
  }

  let resumeFilename = 'sample-resume.pdf';
  let originalResumeName = 'Resume.pdf';

  if (req.file) {
    resumeFilename = req.file.filename;
    originalResumeName = req.file.originalname;

    try {
      const buffer = fs.readFileSync(req.file.path);
      const header = buffer.toString('utf8', 0, 4);
      if (header !== '%PDF') {
        fs.unlinkSync(req.file.path);
        return errorResponse(res, 'Invalid file signature. File must be a valid PDF document.');
      }
    } catch (_err) {
      // Continue if read error
    }
  }

  const newApp: Application = {
    id: 'app-' + Date.now(),
    job_id,
    candidate_id: user.id,
    resume_filename: resumeFilename,
    original_resume_name: originalResumeName,
    cover_letter,
    status: 'APPLIED',
    applied_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  applications.push(newApp);

  statusHistories.push({
    id: 'ash-' + Date.now(),
    application_id: newApp.id,
    previous_status: 'NONE',
    new_status: 'APPLIED',
    actor_id: user.id,
    actor_name: `${user.first_name} ${user.last_name} (Candidate)`,
    candidate_message: 'Application submitted successfully.',
    timestamp: new Date().toISOString(),
  });

  return successResponse(res, newApp, 201);
});

app.get('/api/v1/applications/my/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'CANDIDATE') {
    return errorResponse(res, 'Authentication required as candidate.', 403);
  }

  const candidateApps = applications
    .filter((app) => app.candidate_id === user.id)
    .map((app) => {
      const job = jobs.find((j) => j.id === app.job_id);
      const recProf = job ? recruiterProfiles.find((rp) => rp.user_id === job.recruiter_id) : null;
      return {
        ...app,
        job_title: job?.title || 'Unknown Job',
        company_name: recProf?.company_name || 'Markytics Consulting',
        job_location: job?.location || '',
        employment_type: job?.employment_type || '',
      };
    });

  return successResponse(res, candidateApps);
});

app.get('/api/v1/applications/recruiter/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || (user.role !== 'RECRUITER' && user.role !== 'ADMIN')) {
    return errorResponse(res, 'Only recruiters and administrators can access applicant data.', 403);
  }

  const { job_id, status } = req.query;

  let ownedJobIds = jobs.map((j) => j.id);
  if (user.role === 'RECRUITER') {
    ownedJobIds = jobs.filter((j) => j.recruiter_id === user.id).map((j) => j.id);
  }

  let applicantList = applications.filter((app) => ownedJobIds.includes(app.job_id));

  if (job_id) {
    applicantList = applicantList.filter((app) => app.job_id === job_id);
  }

  if (status) {
    applicantList = applicantList.filter((app) => app.status === status);
  }

  const enrichedList = applicantList.map((app) => {
    const job = jobs.find((j) => j.id === app.job_id);
    const candidateUser = users.find((u) => u.id === app.candidate_id);
    const candidateProf = candidateProfiles.find((cp) => cp.user_id === app.candidate_id);

    return {
      ...app,
      job_title: job?.title || '',
      candidate_name: candidateUser ? `${candidateUser.first_name} ${candidateUser.last_name}` : 'Applicant',
      candidate_email: candidateUser?.email || '',
      candidate_profile: candidateProf || null,
    };
  });

  return successResponse(res, enrichedList);
});

app.post('/api/v1/applications/:id/status/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || (user.role !== 'RECRUITER' && user.role !== 'ADMIN')) {
    return errorResponse(res, 'Candidates cannot change application status. Access denied.', 403);
  }

  const appIdx = applications.findIndex((a) => a.id === req.params.id);
  if (appIdx === -1) {
    return errorResponse(res, 'Application not found.', 404);
  }

  const application = applications[appIdx];
  const job = jobs.find((j) => j.id === application.job_id);

  if (user.role === 'RECRUITER' && job && job.recruiter_id !== user.id) {
    return errorResponse(res, 'Recruiters cannot modify applications for jobs owned by another recruiter.', 403);
  }

  const { new_status, candidate_message } = req.body;
  const validStatuses = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED'];
  if (!validStatuses.includes(new_status)) {
    return errorResponse(res, `Invalid status ${new_status}.`);
  }

  const currentStatus = application.status;

  if (currentStatus === new_status) {
    return successResponse(res, { detail: 'Application is already in this status. No changes made.', application });
  }

  const allowedTransitions: Record<string, string[]> = {
    APPLIED: ['SHORTLISTED', 'REJECTED'],
    SHORTLISTED: ['INTERVIEW', 'REJECTED'],
    INTERVIEW: ['HIRED', 'REJECTED'],
    REJECTED: [],
    HIRED: [],
  };

  if (user.role !== 'ADMIN' && allowedTransitions[currentStatus] && !allowedTransitions[currentStatus].includes(new_status)) {
    return errorResponse(
      res,
      `Invalid workflow transition from ${currentStatus} to ${new_status}. Allowed transitions from ${currentStatus}: [${allowedTransitions[currentStatus].join(', ')}]`,
      400
    );
  }

  applications[appIdx].status = new_status;
  applications[appIdx].updated_at = new Date().toISOString();

  const historyRecord: ApplicationStatusHistory = {
    id: 'ash-' + Date.now(),
    application_id: application.id,
    previous_status: currentStatus,
    new_status,
    actor_id: user.id,
    actor_name: `${user.first_name} ${user.last_name} (${user.role})`,
    candidate_message: candidate_message || undefined,
    timestamp: new Date().toISOString(),
  };
  statusHistories.push(historyRecord);

  const candidateUser = users.find((u) => u.id === application.candidate_id);
  const recProf = job ? recruiterProfiles.find((rp) => rp.user_id === job.recruiter_id) : null;
  const companyName = recProf?.company_name || 'Markytics Consulting Pvt Ltd';

  if (candidateUser) {
    const outboxRecord: EmailNotification = {
      id: 'outbox-' + Date.now(),
      event_ref: `${application.id}:${new_status}`,
      recipient_email: candidateUser.email,
      subject: `Application Update: ${new_status} for ${job?.title || 'Job'} at ${companyName}`,
      template_id: 'STATUS_CHANGE_NOTIFICATION',
      render_data: {
        candidate_name: `${candidateUser.first_name} ${candidateUser.last_name}`,
        job_title: job?.title || 'Job',
        company_name: companyName,
        previous_status: currentStatus,
        new_status,
        candidate_message: candidate_message || '',
      },
      delivery_state: 'SENT',
      attempt_count: 1,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    emailOutbox.push(outboxRecord);
  }

  return successResponse(res, {
    detail: `Application status transitioned from ${currentStatus} to ${new_status}.`,
    application: applications[appIdx],
    history: historyRecord,
  });
});

app.get('/api/v1/applications/:id/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return errorResponse(res, 'Authentication required.', 401);
  }

  const application = applications.find((a) => a.id === req.params.id);
  if (!application) {
    return errorResponse(res, 'Application not found.', 404);
  }

  const job = jobs.find((j) => j.id === application.job_id);

  const isCandidateOwner = user.role === 'CANDIDATE' && application.candidate_id === user.id;
  const isRecruiterOwner = user.role === 'RECRUITER' && job && job.recruiter_id === user.id;
  const isAdmin = user.role === 'ADMIN';

  if (!isCandidateOwner && !isRecruiterOwner && !isAdmin) {
    return errorResponse(res, 'Unauthorized access to this application record.', 403);
  }

  const history = statusHistories.filter((h) => h.application_id === application.id);
  const candidateUser = users.find((u) => u.id === application.candidate_id);
  const candidateProf = candidateProfiles.find((cp) => cp.user_id === application.candidate_id);
  const recProf = job ? recruiterProfiles.find((rp) => rp.user_id === job.recruiter_id) : null;

  return successResponse(res, {
    ...application,
    job_title: job?.title || '',
    company_name: recProf?.company_name || 'Markytics Consulting',
    candidate_name: candidateUser ? `${candidateUser.first_name} ${candidateUser.last_name}` : 'Candidate',
    candidate_email: candidateUser?.email || '',
    candidate_profile: candidateProf || null,
    history,
  });
});

app.get('/api/v1/applications/:id/resume/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return errorResponse(res, 'Authentication required.', 401);
  }

  const application = applications.find((a) => a.id === req.params.id);
  if (!application) {
    return errorResponse(res, 'Application not found.', 404);
  }

  const job = jobs.find((j) => j.id === application.job_id);

  const isCandidateOwner = user.role === 'CANDIDATE' && application.candidate_id === user.id;
  const isRecruiterOwner = user.role === 'RECRUITER' && job && job.recruiter_id === user.id;
  const isAdmin = user.role === 'ADMIN';

  if (!isCandidateOwner && !isRecruiterOwner && !isAdmin) {
    return errorResponse(res, 'Forbidden: You do not have permission to access or download this candidate resume.', 403);
  }

  const filePath = path.join(uploadDir, application.resume_filename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${application.original_resume_name || 'Resume.pdf'}"`);
    return res.sendFile(filePath);
  } else {
    const fallbackPath = path.join(uploadDir, 'sample-resume.pdf');
    if (fs.existsSync(fallbackPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${application.original_resume_name || 'Resume.pdf'}"`);
      return res.sendFile(fallbackPath);
    }
    return errorResponse(res, 'Resume file not found on disk.', 404);
  }
});

// ==========================================
// METRIC DASHBOARDS
// ==========================================

app.get('/api/v1/dashboards/candidate/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'CANDIDATE') {
    return errorResponse(res, 'Candidate authentication required.', 403);
  }

  const myApps = applications.filter((app) => app.candidate_id === user.id);
  const statusCounts = {
    APPLIED: myApps.filter((a) => a.status === 'APPLIED').length,
    SHORTLISTED: myApps.filter((a) => a.status === 'SHORTLISTED').length,
    INTERVIEW: myApps.filter((a) => a.status === 'INTERVIEW').length,
    REJECTED: myApps.filter((a) => a.status === 'REJECTED').length,
    HIRED: myApps.filter((a) => a.status === 'HIRED').length,
  };

  const recentApps = myApps.slice(-5).map((app) => {
    const job = jobs.find((j) => j.id === app.job_id);
    return {
      ...app,
      job_title: job?.title || '',
      company_name: 'Markytics Consulting',
    };
  });

  return successResponse(res, {
    total_applications: myApps.length,
    status_counts: statusCounts,
    recent_activity: recentApps,
  });
});

app.get('/api/v1/dashboards/recruiter/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'RECRUITER') {
    return errorResponse(res, 'Recruiter authentication required.', 403);
  }

  const ownedJobs = jobs.filter((j) => j.recruiter_id === user.id);
  const openJobsCount = ownedJobs.filter((j) => j.status === 'OPEN').length;
  const ownedJobIds = ownedJobs.map((j) => j.id);

  const ownedApps = applications.filter((app) => ownedJobIds.includes(app.job_id));

  const statusCounts = {
    APPLIED: ownedApps.filter((a) => a.status === 'APPLIED').length,
    SHORTLISTED: ownedApps.filter((a) => a.status === 'SHORTLISTED').length,
    INTERVIEW: ownedApps.filter((a) => a.status === 'INTERVIEW').length,
    REJECTED: ownedApps.filter((a) => a.status === 'REJECTED').length,
    HIRED: ownedApps.filter((a) => a.status === 'HIRED').length,
  };

  const recentApplicants = ownedApps.slice(-5).map((app) => {
    const job = jobs.find((j) => j.id === app.job_id);
    const candUser = users.find((u) => u.id === app.candidate_id);
    return {
      ...app,
      job_title: job?.title || '',
      candidate_name: candUser ? `${candUser.first_name} ${candUser.last_name}` : 'Applicant',
    };
  });

  return successResponse(res, {
    open_jobs_count: openJobsCount,
    total_applications: ownedApps.length,
    shortlisted_count: statusCounts.SHORTLISTED,
    interview_count: statusCounts.INTERVIEW,
    hired_count: statusCounts.HIRED,
    status_counts: statusCounts,
    recent_applicants: recentApplicants,
  });
});

app.get('/api/v1/dashboards/admin/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'ADMIN') {
    return errorResponse(res, 'Administrator access required.', 403);
  }

  const totalUsers = users.length;
  const usersByRole = {
    ADMIN: users.filter((u) => u.role === 'ADMIN').length,
    RECRUITER: users.filter((u) => u.role === 'RECRUITER').length,
    CANDIDATE: users.filter((u) => u.role === 'CANDIDATE').length,
  };

  const totalJobsPosted = jobs.filter((j) => j.published_at !== undefined && j.published_at !== null).length;
  const openJobsCount = jobs.filter((j) => j.status === 'OPEN').length;
  const totalApplications = applications.length;
  const successfulHires = applications.filter((a) => a.status === 'HIRED').length;

  return successResponse(res, {
    total_users: totalUsers,
    users_by_role: usersByRole,
    total_jobs_posted: totalJobsPosted,
    open_jobs_count: openJobsCount,
    total_applications: totalApplications,
    successful_hires: successfulHires,
    outbox_count: emailOutbox.length,
  });
});

// ==========================================
// ADMIN USER & SYSTEM MANAGEMENT
// ==========================================

app.get('/api/v1/admin/users/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'ADMIN') {
    return errorResponse(res, 'Admin access required.', 403);
  }
  return successResponse(res, users);
});

app.post('/api/v1/admin/users/:id/toggle-active/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'ADMIN') {
    return errorResponse(res, 'Admin access required.', 403);
  }

  const targetIdx = users.findIndex((u) => u.id === req.params.id);
  if (targetIdx === -1) {
    return errorResponse(res, 'User not found.', 404);
  }

  if (users[targetIdx].id === user.id) {
    return errorResponse(res, 'You cannot deactivate your own admin account.', 400);
  }

  users[targetIdx].is_active = !users[targetIdx].is_active;
  return successResponse(res, {
    detail: `User ${users[targetIdx].email} status set to ${users[targetIdx].is_active ? 'Active' : 'Inactive'}.`,
    user: users[targetIdx],
  });
});

// Email Notification Outbox Inspector
app.get('/api/v1/notifications/outbox/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'RECRUITER')) {
    return errorResponse(res, 'Access denied to outbox logs.', 403);
  }
  return successResponse(res, emailOutbox);
});

// Start Express Server
async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: path.join(process.cwd(), 'frontend'),
      configFile: path.join(process.cwd(), 'frontend', 'vite.config.ts'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'frontend', 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(process.cwd(), 'frontend', 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Markytics Preview Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
