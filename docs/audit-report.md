# End-to-End System Audit Report: Markytics Job Portal

**Audit Date**: November 2, 2026  
**Auditor**: Senior Full-Stack Engineer, Security Reviewer, & API QA Inspector  
**Target Repository**: Markytics Consulting Pvt Ltd Intern Onboarding & Recruitment Management System  

---

## 1. Scope & Environment Summary

The audit covered the complete full-stack Job Portal and Recruitment Management System codebase:
- **Backend Architecture**: Django 5.0 + Django REST Framework with custom User model (`accounts.User`), role permissions (`IsCandidate`, `IsRecruiter`, `IsAdminUserRole`), session cookie authentication (`sessionid`), and CSRF protection (`csrftoken`).
- **Live Preview Runtime**: Express Node.js REST API engine (`server.ts`) running synchronously with Vite on port 3000.
- **Frontend Architecture**: React 19 SPA + Vite + React Router + Axios with CSRF token interceptor, Tailwind CSS styling, responsive layout, dark mode, and role-aware navigation.
- **Database Layer**: PostgreSQL normalized schema with explicit foreign keys, `unique_together` database constraint on `(job, candidate)` applications, and indexes.
- **File Management**: Multipart PDF upload parser with 5MB maximum file size limit, magic byte validation (`%PDF`), and secure role-gated download endpoints.
- **Transactional Notifications**: Database-backed email outbox pattern (`EmailNotification`) with live email outbox inspector UI and worker polling support.

---

## 2. Executive Findings Summary

| Finding ID | Severity | Component | Summary / Root Cause | Status |
| :--- | :--- | :--- | :--- | :--- |
| **AUD-01** | **P0 (Security)** | Authentication | Self-registration endpoint must strictly forbid self-assigning `ADMIN` role. | **FIXED / VERIFIED** |
| **AUD-02** | **P0 (Security)** | Authorization | Candidates must be strictly forbidden from setting application status. | **FIXED / VERIFIED** |
| **AUD-03** | **P0 (Security)** | Media / Resumes | Unauthenticated or cross-recruiter access to private PDF resumes must be blocked. | **FIXED / VERIFIED** |
| **AUD-04** | **P1 (Data Integrity)** | Applications | Candidate cannot apply to the same job twice (enforced at DB level). | **FIXED / VERIFIED** |
| **AUD-05** | **P1 (Business Rules)** | Job Validation | Salary min > max or experience min > max must be rejected. | **FIXED / VERIFIED** |
| **AUD-06** | **P1 (Workflow)** | Stage Transitions | Invalid status transitions (e.g. APPLIED &rarr; HIRED directly) must be blocked. | **FIXED / VERIFIED** |
| **AUD-07** | **P2 (Usability)** | Auth | Password reset endpoint must return generic response without revealing account existence. | **FIXED / VERIFIED** |
| **AUD-08** | **P2 (Privacy)** | Talent Search | Private candidate profiles hidden from public search unless candidate applied to recruiter job. | **FIXED / VERIFIED** |

---

## 3. Applied Fixes & Verification Evidence

1. **Role Security Enforcement**:
   - Updated `RegisterSerializer` and `server.ts` `/api/v1/auth/register/` to reject any registration attempt specifying `role: 'ADMIN'`.
   - Admin accounts can only be created via management commands or superuser workflow.
2. **Database Unique Constraints**:
   - Enforced `unique_together = ('job', 'candidate')` in `applications.Application` model to prevent duplicate applications.
3. **Private Resume Access Control**:
   - Configured `ApplicationResumeDownloadView` and `/api/v1/applications/:id/resume/` to verify session ownership (candidate owner, job recruiter owner, or admin). Unauthorized access returns `403 Forbidden`.
4. **Idempotent Outbox Notifications**:
   - Repeated same-status transition requests do not duplicate history records or email outbox entries.

---

## 4. Remaining Operational Requirements

- Production deployment should enable `CSRF_COOKIE_SECURE=True` and `SESSION_COOKIE_SECURE=True` over HTTPS.
- Configure external virus scanner (e.g. ClamAV) for uploaded resume media volumes in production environments.
