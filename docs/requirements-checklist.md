# Requirements Verification Checklist

| Requirement | Implementation Location | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **Custom User Model** | `backend/accounts/models.py` | Unique email login identifier, role choices. | **PASS** |
| **Role-Based Access Control** | `backend/accounts/permissions.py`, `server.ts` | Endpoint permission guards for Admin, Recruiter, Candidate. | **PASS** |
| **Self-Registration Security** | `RegisterSerializer`, `server.ts` | Allows Candidate or Recruiter only. Admin self-registration blocked. | **PASS** |
| **Session Authentication** | `server.ts`, `backend/config/settings.py` | HttpOnly `sessionid` and `csrftoken` cookies. | **PASS** |
| **Job Management** | `backend/jobs/`, `server.ts`, `MyJobsPage.tsx` | Recruiters create, edit, publish, close owned jobs. | **PASS** |
| **Search & Multi-Skill Filter** | `JobListPage.tsx`, `server.ts` | Full-text keyword search and ALL-semantics skill filtering. | **PASS** |
| **Private Resume Upload** | `server.ts`, `applications/views.py` | Multipart PDF upload (5MB limit) with signature check (`%PDF`). | **PASS** |
| **Authorized Resume Access** | `ResumeViewerModal.tsx`, `server.ts` | Authenticated download guarded by candidate, recruiter, admin permissions. | **PASS** |
| **Duplicate Application Block** | `server.ts`, `applications/models.py` | `unique_together = ('job', 'candidate')` DB constraint. | **PASS** |
| **Stage Transitions & History** | `ApplicantsPage.tsx`, `server.ts` | Backend-enforced transitions (`APPLIED` &rarr; `SHORTLISTED` &rarr; `INTERVIEW` &rarr; `HIRED`). | **PASS** |
| **Transactional Email Outbox** | `OutboxModal.tsx`, `server.ts` | Status changes trigger outbox record in same transaction. | **PASS** |
| **Scoped Dashboard Metrics** | `RecruiterDashboard.tsx`, `AdminDashboard.tsx` | Recruiter scoped counts; Admin system-wide aggregates. | **PASS** |
| **API Documentation** | `ApiDocsPage.tsx`, `backend/config/urls.py` | DRF OpenAPI schema & Swagger UI view. | **PASS** |
| **Docker Deployment** | `docker-compose.yml`, `Dockerfile.backend` | PostgreSQL database, Django API, React frontend, Mailpit. | **PASS** |
