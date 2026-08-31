# Architectural Specification: Future Supabase Auth & Multi-Tenancy

## 1. Overview & Objective

This document outlines the end-to-end architectural blueprint for transitioning **Catalyst OS** from **Public Demonstration Mode** (anonymous shared database with preloaded personas) to **Multi-Tenant User Mode** (private accounts with Supabase Auth, GitHub OAuth, and Row Level Security).

---

## 2. Target Multi-Tenancy Data Model

Every user-owned table will introduce an explicit `user_id` foreign key referencing Supabase's `auth.users` table:

```sql
-- Example Schema Alteration
ALTER TABLE job_applications ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE skills ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE projects ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE project_milestones ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE certifications ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE resources ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE coding_problems ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE coding_profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE resumes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE resume_checks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE cover_letters ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE mock_interview_sessions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
```

---

## 3. Supabase Auth & SSR Architecture

### 3.1 Client & Middleware Layer (`@supabase/ssr`)
When activated, the client initialization will transition to cookie-based session hydration:

```
[Browser Request]
       │
       ▼
[Next.js Middleware: src/middleware.js]
  - Reads secure HttpOnly auth token from cookies
  - Refreshes expired sessions via Supabase SSR
  - Injects `user_id` into request context
       │
       ▼
[Server Route Handler / Server Component]
  - createServerClient() reads verified user session
  - Queries automatically scoped to auth.uid()
```

---

## 4. Row Level Security (RLS) Policy Specifications

Every table will enforce strict tenant isolation at the database engine level:

```sql
-- 1. Enable RLS on all tables
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- 2. Authenticated User CRUD Policies
CREATE POLICY "Users can manage their own job applications"
ON job_applications
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own skills"
ON skills
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own projects"
ON projects
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Public Portfolio Read Access
CREATE POLICY "Public portfolios are viewable by everyone"
ON projects
FOR SELECT
TO anon
USING (is_featured = 1);
```

---

## 5. Dual-Mode Coexistence (Demo Mode + Authenticated Mode)

To ensure evaluators and hiring managers can continue exploring Catalyst OS without being forced to create an account, the architecture supports a **dual-state mode**:

| Mode | Trigger | Data Source | Mutation Behavior |
| :--- | :--- | :--- | :--- |
| **Public Demo Mode** | Unauthenticated visitor (`auth.user === null`) | In-memory `DEMO_PERSONAS` (`sharvin_ml`, `elena_ai`, `marcus_data`) + `localStorage` | Changes persist in browser `localStorage` only; database mutations skipped. |
| **Authenticated Mode** | Logged-in user via GitHub OAuth | Private Supabase PostgreSQL database tables scoped to `auth.uid()` | Full cloud synchronization with real-time RLS protections. |

---

## 6. Migration Sequence & Activation Steps

1. **Step 1**: Install `@supabase/ssr` (`npm install @supabase/ssr`).
2. **Step 2**: Enable GitHub OAuth in Supabase Dashboard (OAuth Client ID & Secret from GitHub Developer Settings).
3. **Step 3**: Execute database migration script (`supabase/migrations/20260901_auth_multi_tenancy.sql`) adding `user_id` columns, foreign keys, and RLS policies.
4. **Step 4**: Implement `<AuthButton />` and login dialog in `src/components/Sidebar.js`.
5. **Step 5**: Provide "Import Demo Data into My Account" prompt upon first sign-in.
