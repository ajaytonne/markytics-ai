# Markytics Consulting Job Portal & Recruitment Management System

A full-stack Job Portal and Recruitment Management System built for the **Markytics Consulting Pvt Ltd Intern Onboarding Program**.

## 1. Project Directory Structure

```text
├── frontend/             # React SPA (Vite + Tailwind CSS + Axios + React Router)
│   ├── src/              # Page components, layouts, context, hooks, types
│   ├── Dockerfile        # Multi-stage build (Node build -> Nginx on port 3000)
│   ├── nginx.conf        # Production Nginx reverse proxy (/api & /media -> backend:8000)
│   ├── vite.config.ts    # Development Vite config with /api & /media proxies
│   ├── package.json      # Frontend UI dependencies
│   └── index.html        # HTML entrypoint
├── backend/              # Django REST Framework API Service
│   ├── accounts/         # User auth, custom user model, profiles, password reset tokens
│   ├── jobs/             # Job postings, categories, skill tags
│   ├── applications/     # PDF resume upload, stage transition history
│   ├── notifications/    # Transactional email outbox & management commands
│   ├── dashboards/       # Recruiter & Admin metric aggregates
│   ├── config/           # Django settings, WSGI, ASGI, routing
│   ├── Dockerfile        # Python 3.12 container running migrate, seed_demo_data & Gunicorn
│   └── requirements.txt  # Python packages
├── preview-server/       # Live preview engine
│   └── server.ts         # Express server starting Vite middleware from frontend/
├── docker-compose.yml    # Full-stack Docker orchestration (PostgreSQL, Backend, Worker, Mailpit, Frontend)
└── package.json          # Root script runner ("npm run dev" starts preview-server/server.ts)
```

---

## 2. System Architecture


```mermaid
graph TD
    Client[React + Vite Frontend\nRole-Based SPA] -->|Session Cookies & CSRF| API[Django REST Framework API / Express REST Engine]
    API -->|Django ORM / SQL| DB[(PostgreSQL Database)]
    API -->|Upload / Download Guard| Storage[(Private Media Storage / Resumes)]
    API -->|Transactional Event| Outbox[(Email Notification Outbox)]
    Outbox -->|Worker Loop| SMTP[Local Email Capture / Mailpit]
```

---

## 2. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    User ||--o| CandidateProfile : "has 1:1"
    User ||--o| RecruiterProfile : "has 1:1"
    User ||--o{ Job : "posts (as Recruiter)"
    JobCategory ||--o{ Job : "categorizes"
    Job ||--o{ Application : "receives"
    User ||--o{ Application : "applies (as Candidate)"
    Application ||--o{ ApplicationStatusHistory : "tracks timeline"
    User ||--o{ ApplicationStatusHistory : "triggers stage change"
    Application ||--o{ EmailNotification : "generates outbox email"

    User {
        string id PK
        string email UK
        string first_name
        string last_name
        string role "ADMIN | RECRUITER | CANDIDATE"
        boolean is_active
    }

    CandidateProfile {
        string id PK
        string user_id FK
        string headline
        string bio
        json skills
        int years_of_experience
        string location
        string search_visibility "PUBLIC | PRIVATE"
    }

    Job {
        string id PK
        string recruiter_id FK
        string title
        string description
        string category_id FK
        json skills
        string location
        string employment_type "FULL_TIME | PART_TIME | CONTRACT | INTERNSHIP"
        string workplace_type "ONSITE | HYBRID | REMOTE"
        int min_experience
        int max_experience
        int min_salary
        int max_salary
        string status "DRAFT | OPEN | CLOSED"
        datetime application_deadline
    }

    Application {
        string id PK
        string job_id FK
        string candidate_id FK "UK (job_id, candidate_id)"
        string resume_filename
        string status "APPLIED | SHORTLISTED | INTERVIEW | REJECTED | HIRED"
        datetime applied_at
    }

    ApplicationStatusHistory {
        string id PK
        string application_id FK
        string previous_status
        string new_status
        string actor_id FK
        string candidate_message
        datetime timestamp
    }
```

---

## 3. Permission Matrix

| Resource / Endpoint | Anonymous Visitor | Candidate | Recruiter | Administrator |
| :--- | :--- | :--- | :--- | :--- |
| **Browse / Search Published OPEN Jobs** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **View Draft Jobs** | ❌ Denied | ❌ Denied | ✅ Owned Jobs Only | ✅ Allowed All |
| **Submit Application (with Resume PDF)** | ❌ Denied | ✅ Allowed (1 app per job) | ❌ Denied | ❌ Denied |
| **View Candidate Own Applications & History** | ❌ Denied | ✅ Own Apps Only | ❌ Denied | ✅ Allowed All |
| **View Recruiter Applicants** | ❌ Denied | ❌ Denied | ✅ Owned Jobs Only | ✅ Allowed All |
| **Change Application Stage** | ❌ Denied | ❌ Denied | ✅ Owned Jobs Only | ✅ Allowed All |
| **Download PDF Resume** | ❌ Denied | ✅ Own Resume Only | ✅ Owned Job Applicants | ✅ Allowed All |
| **Talent Directory Search** | ❌ Denied | ❌ Denied | ✅ Public Profiles & Applicants | ✅ Allowed All |
| **Admin User Governance** | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed |

---

## 4. Application Stage Transition Rules

Allowed workflow transitions:
- **APPLIED** &rarr; **SHORTLISTED** or **REJECTED**
- **SHORTLISTED** &rarr; **INTERVIEW** or **REJECTED**
- **INTERVIEW** &rarr; **HIRED** or **REJECTED**
- **HIRED** and **REJECTED** are terminal statuses.

Backend Enforcement Rules:
1. Candidate self-status modifications are strictly rejected (`403 Forbidden`).
2. Recruiters cannot change stages for jobs owned by other recruiters (`403 Forbidden`).
3. Repeated requests with the current status are idempotent and do not duplicate history records or email outbox notifications.
4. Each valid stage change generates an `ApplicationStatusHistory` entry and a transactional `EmailNotification` outbox record in a single database transaction.

---

## 5. Explicit Dashboard Metric Definitions

- **Jobs Posted**: Count of job records that have been published at least once (`published_at != null`), excluding drafts.
- **Successful Hires**: Count of applications currently in `HIRED` status.
- **Recruiter Dashboard Metrics**: All counts are strictly scoped to jobs owned by the authenticated recruiter (`recruiter_id == user.id`).
- **Admin Dashboard Metrics**: Platform-wide aggregates across all users, job postings, and applications.

---

## 6. Docker & Local Setup Instructions

### Prerequisites
- Docker & Docker Compose installed.

### Quick Start
```bash
# 1. Clone repository and start services
docker-compose up --build -d

# 2. Run Database Migrations
docker-compose exec backend python manage.py migrate

# 3. Seed Demo Data (Markytics jobs, candidate/recruiter accounts)
docker-compose exec backend python manage.py seed_demo_data

# 4. Access Platform
# Frontend Web App: http://localhost:3000
# Django Backend REST API: http://localhost:8000/api/v1/
# Mailpit Local Email Capture Inspector: http://localhost:8025
```

---

## 7. Demo Account Credentials (Quick Selector)

- **Candidate Demo**: `candidate@markytics.com` (Password: `Demo@1234`)
- **Recruiter Demo**: `recruiter@markytics.com` (Password: `Demo@1234`)
- **Admin Demo**: `admin@markytics.com` (Password: `Demo@1234`)

*Or click the one-click demo buttons in the top header or sign-in page.*


---

## 8. Automated Tests & Verification

```bash
# Run backend test suite
docker-compose exec backend python manage.py test tests
```

Tests cover:
- Registration cannot self-assign `ADMIN` role.
- Role-based privilege escalation rejection.
- Recruiter cross-user job isolation.
- Unique candidate application constraint (1 app per job).
- Valid vs invalid application stage transitions.
- Private resume download security guard.

---

## 9. Production Hardening Checklist

1. **Secrets**: Set `DJANGO_SECRET_KEY` and set `DEBUG="False"` in production environment.
2. **Cookies**: Set `CSRF_COOKIE_SECURE=True` and `SESSION_COOKIE_SECURE=True` when running behind HTTPS.
3. **Malware Scanning**: In production, pass uploaded resume PDFs through an antivirus service (e.g. ClamAV) prior to storing in media volume.
4. **Rate Limiting**: Enable Django REST Framework throttling (`ScopedRateThrottle`) on sensitive login and password reset endpoints.

## 10. Free Render Demo

The [`render.yaml`](./render.yaml) Blueprint deploys the interactive Express preview server and production-built React frontend as a single free web service. This demo uses in-memory sample data; accounts, jobs, and applications are not durable and may reset when the service restarts. It does not run the Django/PostgreSQL backend. Render's free service may also spin down when idle. Use persistent database and file storage for production data.
