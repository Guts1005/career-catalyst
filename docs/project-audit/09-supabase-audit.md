# 09 — Supabase & Backend Audit: Catalyst OS

A comprehensive audit of Supabase PostgreSQL database interactions, client architecture, query patterns, security assumptions, and data layer integrity.

---

## 1. Supabase Client Configuration (`src/lib/supabase.js`)

The Supabase client is initialized as a singleton:

```javascript
import { createClient } from '@supabase/supabase-js';
import dns from 'node:dns';

// DNS Fallback for network environments
try {
  const resolver = new dns.Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore in browser/edge environments
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://uedfokzpsgajinewqyam.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

let supabaseClient = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabaseClient;
}
```

### Observations & Risks:
1. **Hardcoded Fallback Credentials**: Default Project URL and Anon JWT key are committed in plain text in `src/lib/supabase.js`. While anon keys are technically public, committing specific project credentials in code rather than requiring `.env.local` is a security anti-pattern.
2. **Top-Level `node:dns` Import**: Node-specific `node:dns` module is imported at the top level. While safely caught, it triggers bundler warnings in edge/browser contexts.

---

## 2. Database Schema & Tables Inventory

Based on repository queries across all 29 API routes, the application interacts with **12 primary tables**:

| Table Name | Referenced In Routes | Operations | Description |
| :--- | :--- | :--- | :--- |
| `job_applications` | `api/jobs`, `api/jobs/[id]`, `api/backup`, `api/readiness`, `api/dashboard` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Application pipeline tracking, status, match score, salary |
| `skills` | `api/skills`, `api/skills/[id]`, `api/jobs`, `api/github/import`, `api/backup` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Competency matrix, proficiency levels, categories, evidence tiers |
| `projects` | `api/projects`, `api/projects/[id]`, `api/github/import`, `api/backup` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Architectural case studies, tech stack, verification status |
| `project_milestones`| `api/projects`, `api/projects/[id]/milestones`, `api/backup` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Deliverable checklists tied to specific projects |
| `certifications` | `api/certifications`, `api/certifications/[id]`, `api/backup` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Verified credentials, providers, deadlines, progress |
| `resources` | `api/resources`, `api/resources/[id]`, `api/backup` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Technical papers, reading list, ratings, takeaways |
| `interview_questions`| `api/interview-prep`, `api/interview-prep/[id]`, `api/backup`| `SELECT`, `INSERT`, `UPDATE` | Systems design and ML questions, company tags, rubrics |
| `user_question_progress`| `api/interview-prep`, `api/backup`, `api/dashboard` | `SELECT`, `INSERT`, `UPDATE` | Tracks user mastery status on specific questions |
| `coding_problems` | `api/coding-tracker`, `api/coding-tracker/[id]`, `api/backup` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Algorithmic problems, patterns, difficulty, solve time |
| `coding_profiles` | `api/coding-tracker`, `api/backup` | `SELECT`, `INSERT`, `UPDATE` | LeetCode/Codeforces profile handle sync |
| `resumes` | `api/resume`, `api/backup`, `api/readiness` | `SELECT`, `INSERT`, `UPDATE` | Structured work history, education, and contact metadata |
| `resume_checks` | `api/ats-checker`, `api/ats-checker/[id]`, `api/analytics` | `SELECT`, `INSERT`, `DELETE` | Historical ATS scan match results and missing keywords |
| `cover_letters` | `api/cover-letter` | `SELECT`, `INSERT` | Generated STAR recruiter pitches and custom letters |
| `github_analyses` | `api/github`, `api/github/[id]` | `SELECT`, `INSERT`, `DELETE` | Cached repository scan metrics and language distributions |
| `mock_interview_sessions`| `api/mock-interview` | `SELECT`, `INSERT` | Timed mock assessment transcripts and rubric evaluations |
| `salary_benchmarks`| `api/salary-insights` | `SELECT`, `INSERT` | Role and location percentile salary benchmarks |
| `activity_log` | Almost all mutating API routes | `SELECT`, `INSERT` | System audit ledger recording creations, updates, and deletes |

---

## 3. Schema & Row Level Security (RLS) Verification

> **⚠️ Formal Verification Notice**:
> **Unable to verify directly from repository**.
> The repository does not contain SQL migration scripts, schema definitions, or RLS policy files (e.g. `supabase/migrations/` or `schema.sql`). All table structures, column constraints, indexes, and Row Level Security rules exist exclusively in the remote Supabase cloud project.

---

## 4. Authentication & Access Control Findings

1. **Zero User Authentication**:
   - The application does not implement user login, sessions, or JWT authentication (e.g. `@supabase/ssr` or `supabase.auth.getUser()`).
   - Every client and API route interacts with Supabase using the public anonymous role (`anon`).
2. **Global Shared Multi-Tenancy Risk**:
   - Because there is no `user_id` or tenant isolation on queries, any mutation (`INSERT`, `UPDATE`, `DELETE`) operates on the shared global dataset in the Supabase database.
3. **Defense-in-Depth Mitigation (`src/lib/security.js`)**:
   - The developer implemented an in-memory application-layer security filter (`whitelistFields`, `sanitizeObject`, `validateRange`, `validateEnum`) to prevent injection attacks and payload tampering before SQL generation.

---

## 5. Critical Database Bug Identified: `/api/projects`

### The Bug:
In `src/app/api/projects/route.js` (lines 26–33 and 82):
```javascript
const [{ data: projects, error: projError }, { data: milestones, error: milesError }] = await Promise.all([
  query,
  supabase.from('project_milestones').select('*')
]);

// Line 82:
const finalProjects = (projectsWithMilestones && projectsWithMilestones.length > 0) ? projectsWithMilestones : defaultProjects;
```

- **Failure Mode**: `projectsWithMilestones` is never declared in the function scope, throwing `ReferenceError: projectsWithMilestones is not defined`.
- **Live Impact**: Probed live URL `https://ccsharvin.vercel.app/api/projects` returned **HTTP 500: Internal Server Error**.
- **Recommended Solution**: Assemble `projectsWithMilestones` by mapping `projects` to their corresponding `milestones` before evaluating `finalProjects`.
