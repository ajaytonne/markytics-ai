# API Test Matrix & Execution Results

**Scope**: All discovered `/api/v1/*` endpoints evaluated against Admin, Recruiter A, Recruiter B, Candidate A, Candidate B, and Anonymous test identities.

---

| Path | Method | Purpose | Test Cases Executed | Status | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth/csrf/` | `GET` | Initialize CSRF Cookie | Public access; returns `X-CSRFToken` header. | **PASS** | `200 OK`, cookie set. |
| `/api/v1/auth/register/` | `POST` | Public Registration | 1. Candidate registration.<br>2. Recruiter registration.<br>3. Admin registration attempt. | **PASS** | 1 & 2 succeed (`201`).<br>3 rejected with `400 Bad Request`. |
| `/api/v1/auth/login/` | `POST` | Session Login | 1. Valid credentials.<br>2. Invalid password.<br>3. Deactivated user. | **PASS** | 1 sets HttpOnly `sessionid` (`200`).<br>2 & 3 return `401 Unauthorized`. |
| `/api/v1/auth/logout/` | `POST` | Logout | Clears active session cookie. | **PASS** | `200 OK`, cookie cleared. |
| `/api/v1/auth/me/` | `GET` | Current User Session | 1. Authenticated candidate.<br>2. Unauthenticated request. | **PASS** | 1 returns user + profile (`200`).<br>2 returns `401 Unauthorized`. |
| `/api/v1/auth/password-reset/` | `POST` | Password Reset Request | 1. Existing email.<br>2. Nonexistent email. | **PASS** | Both return generic non-revealing response (`200`). Token generated in outbox. |
| `/api/v1/jobs/` | `GET` | Browse / Search Jobs | 1. Anonymous visitor.<br>2. Multi-term full-text search.<br>3. Skills ALL filter. | **PASS** | Returns published OPEN jobs (`200`). Draft jobs hidden from public. |
| `/api/v1/jobs/` | `POST` | Create Job | 1. Recruiter creation.<br>2. Candidate creation attempt.<br>3. Min salary > max salary. | **PASS** | 1 succeeds (`201`).<br>2 rejected (`403 Forbidden`).<br>3 rejected (`400 Bad Request`). |
| `/api/v1/jobs/:id/` | `PUT` | Edit Owned Job | 1. Recruiter A edits own job.<br>2. Recruiter B edits Recruiter A's job. | **PASS** | 1 succeeds (`200`).<br>2 rejected (`403 Forbidden`). |
| `/api/v1/applications/` | `POST` | Submit Application | 1. Candidate applies with PDF.<br>2. Duplicate application attempt.<br>3. Recruiter applies attempt. | **PASS** | 1 succeeds (`201`).<br>2 rejected (`400 Bad Request`).<br>3 rejected (`403 Forbidden`). |
| `/api/v1/applications/:id/status/` | `POST` | Status Stage Transition | 1. Recruiter APPLIED &rarr; SHORTLISTED.<br>2. Invalid APPLIED &rarr; HIRED transition.<br>3. Candidate status change attempt. | **PASS** | 1 succeeds (`200`) + outbox email.<br>2 rejected (`400 Bad Request`).<br>3 rejected (`403 Forbidden`). |
| `/api/v1/applications/:id/resume/` | `GET` | Download PDF Resume | 1. Candidate owner download.<br>2. Recruiter job owner download.<br>3. Unrelated candidate download. | **PASS** | 1 & 2 return PDF file (`200`).<br>3 rejected (`403 Forbidden`). |
| `/api/v1/candidates/search/` | `GET` | Talent Search Directory | 1. Recruiter search.<br>2. Candidate search attempt. | **PASS** | 1 returns public & applicant profiles (`200`).<br>2 rejected (`403 Forbidden`). |
| `/api/v1/dashboards/candidate/` | `GET` | Candidate Metrics | Candidate scoped application counts. | **PASS** | `200 OK`. |
| `/api/v1/dashboards/recruiter/` | `GET` | Recruiter Metrics | Recruiter owned job application counts. | **PASS** | `200 OK`. |
| `/api/v1/dashboards/admin/` | `GET` | Admin Metrics | System-wide aggregates (users, jobs posted, hires). | **PASS** | `200 OK`. |
