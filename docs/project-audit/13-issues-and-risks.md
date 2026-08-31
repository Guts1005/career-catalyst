# 13 — Issues and Risks Register: Catalyst OS

A prioritized register of confirmed bugs, architectural risks, security concerns, and technical vulnerabilities identified during the Phase 1 audit.

---

## 1. Confirmed Issues & Bugs Register

| ID | Issue Description | Severity | Impact Area | Evidence / Affected Files |
| :--- | :--- | :---: | :--- | :--- |
| **ISSUE-01** | `ReferenceError: projectsWithMilestones is not defined` in API | **Critical (P0)** | Production API | `src/app/api/projects/route.js:L82` (Live returns HTTP 500) |
| **ISSUE-02** | Serverless read-only filesystem crash during security event logging | **High (P1)** | Security / Logging | `src/lib/security.js:L37` (`fs.appendFileSync` on Vercel) |
| **ISSUE-03** | Hardcoded Supabase Project URL and Anon Key in source code | **High (P1)** | Security / Config | `src/lib/supabase.js:L12-13` (Plaintext fallback credentials) |
| **ISSUE-04** | Top-level Node.js `node:dns` import in isomorphic Supabase client | **Medium (P2)** | Build / Bundling | `src/lib/supabase.js:L2` (Node runtime dependency) |
| **ISSUE-05** | Missing Skip-to-Main-Content navigation for assistive tech | **Medium (P2)** | Accessibility | `src/app/layout.js:L25` (Violates WCAG 2.1 AA 2.4.1) |
| **ISSUE-06** | Sub-app state mutations bypass global `CareerContext` readiness | **Medium (P2)** | UX / State Sync | `/certifications`, `/coding-tracker`, `/resources` |
| **ISSUE-07** | Sub-4.5:1 color contrast on Dark Mode muted micro-labels | **Medium (P2)** | Accessibility | `src/app/globals.css:L29` (`--text-muted: #71717a` on dark) |
| **ISSUE-08** | Monolithic page files combining UI, state, and business logic | **Low (P3)** | Maintainability | `job-tracker/page.js` (616L), `resume-builder/page.js` (483L) |
| **ISSUE-09** | Heavy inline style duplication across JSX components | **Low (P3)** | Code Hygiene | `src/app/page.js`, `job-tracker/page.js`, `skills/page.js` |
| **ISSUE-10** | Missing static response caching on invariant benchmark endpoints | **Low (P3)** | Performance | `/api/salary-insights`, `/api/resources` |

---

## 2. Risk Assessment Matrix

```
       ▲
       │  [ISSUE-01: API 500 Bug]
  HIGH │  [ISSUE-03: Hardcoded Keys]     [ISSUE-02: Serverless Logger]
       │
IMPACT │  [ISSUE-06: State Divergence]   [ISSUE-05: Missing Skip Link]
       │  [ISSUE-07: a11y Contrast]
       │
  LOW  │  [ISSUE-08: Monolithic Pages]   [ISSUE-04: node:dns import]
       │  [ISSUE-09: Inline Styling]     [ISSUE-10: Caching]
       └─────────────────────────────────────────────────────────────►
                  LOW                         HIGH
                            LIKELIHOOD / EXPOSURE
```

---

## 3. Deep-Dive on High-Severity Risks

### 3.1 ISSUE-01: `ReferenceError` in `/api/projects`
- **Root Cause**: `projectsWithMilestones` is evaluated on line 82 of `src/app/api/projects/route.js` without having been declared or populated from `projects` and `milestones`.
- **User Impact**: Any consumer attempting to fetch live project milestones via `/api/projects` receives an internal server error.
- **Remediation Complexity**: **Low** (10-minute fix to properly map `milestones` to `projects` array).

### 3.2 ISSUE-02: Serverless Filesystem Incompatibility
- **Root Cause**: Next.js API routes running in Vercel Serverless Functions execute in a container where the root directory (`process.cwd()`) is read-only. `fs.appendFileSync('logs/security.log')` will consistently fail in production.
- **User Impact**: Silent failure of security event logging; developers cannot review security alerts or blocked requests in Vercel.
- **Remediation Complexity**: **Low** (Switch to structured `console.warn`/`console.error` for native Vercel Log Drain ingestion).

### 3.3 ISSUE-03: Hardcoded Project Credentials
- **Root Cause**: Fallback Supabase credentials are hardcoded directly in `src/lib/supabase.js`.
- **User Impact**: Exposes the development project URL and anon key to anyone reading the repository, while making environment variable configuration confusing.
- **Remediation Complexity**: **Low** (Enforce required environment variables and remove hardcoded fallback strings).

### 3.4 Missing Repository SQL Schemas / RLS Verification
- **Status**: **Unable to verify directly from repository**.
- **Risk**: Without checked-in migrations (`supabase/migrations/`), database schema evolution is untracked and cannot be recreated in staging or local test environments automatically.
