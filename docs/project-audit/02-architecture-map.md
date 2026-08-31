# 02 — Architecture Map: Catalyst OS

## 1. System Topology Map

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       CLIENT BROWSER                                        │
│                                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                  ROOT HTML & THEME                                    │  │
│  │  - Inline <head> script prevents theme flash (localStorage: 'catalyst-theme')         │  │
│  │  - Global CSS Variables & Typography (Geist Sans / Geist Mono)                        │  │
│  └───────────────────────────────────────────┬───────────────────────────────────────────┘  │
│                                              │                                              │
│                                              ▼                                              │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                    GLOBAL CONTEXT PROVIDER (src/context/CareerContext.js)             │  │
│  │  - Active Persona State ('sharvin_ml', 'elena_rag', 'marcus_lakehouse')               │  │
│  │  - Target Role Definition & Calibration State                                         │  │
│  │  - In-Memory Skills, Projects, Jobs, Resume State                                     │  │
│  │  - Reactive Readiness Calculator & Next Best Action Dispatcher                        │  │
│  └───────┬───────────────────────────────────┬───────────────────────────────────┬───────┘  │
│          │                                   │                                   │          │
│          ▼                                   ▼                                   ▼          │
│  ┌───────────────┐                   ┌───────────────┐                   ┌───────────────┐  │
│  │ GLOBAL SHELL  │                   │ CLIENT PAGES  │                   │ PUBLIC PAGES  │  │
│  │ - Sidebar     │                   │ - Overview (/)│                   │ - /portfolio/ │  │
│  │ - MobileNav   │                   │ - 15 Sub-apps │                   │   [username]  │  │
│  │ - CmdPalette  │                   │ - Modal Views │                   │ (Server RSC)  │  │
│  │ - Toast Engine│                   │ ('use client')│                   │               │  │
│  └───────┬───────┘                   └───────┬───────┘                   └───────┬───────┘  │
└──────────┼───────────────────────────────────┼───────────────────────────────────┼──────────┘
           │                                   │                                   │
           │ REST HTTP API Requests            │ REST HTTP API Requests            │ Direct DB
           ▼                                   ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           VERCEL SERVERLESS LAMBDA LAYER (Next.js App Router)               │
│                                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                           SECURITY MIDDLEWARE (src/lib/security.js)                   │  │
│  │  - parseAndValidateBody() (100KB payload cap, JSON parse guard)                       │  │
│  │  - whitelistFields() (Strips unallowed schema attributes)                             │  │
│  │  - sanitizeObject() (HTML tag stripping, control character removal)                   │  │
│  │  - logSecurityEvent() (Local file logger — Vercel read-only issue!)                    │  │
│  └───────────────────────────────────────────┬───────────────────────────────────────────┘  │
│                                              │                                              │
│                                              ▼                                              │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                               29 REST API ROUTE HANDLERS                              │  │
│  │  /api/jobs, /api/skills, /api/projects, /api/ats-checker, /api/certifications, etc.   │  │
│  │  - Try-Catch Fallback: Returns hardcoded benchmark data if Supabase is unreachable   │  │
│  └───────────────────────────────────────────┬───────────────────────────────────────────┘  │
└──────────────────────────────────────────────┼──────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SUPABASE CLOUD POSTGRESQL                                   │
│  URL: https://uedfokzpsgajinewqyam.supabase.co                                              │
│  Tables: job_applications, skills, projects, project_milestones, certifications, etc.       │
│  Auth Mode: Public Anon JWT Access (Zero RLS / No Tenant Isolation)                         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Server vs. Client Component Boundaries

Next.js App Router promotes Server Components by default. However, an analysis of the component tree reveals that **16 out of 18 frontend pages and 11 out of 12 components are declared with `'use client'`**.

| Route / File | Component Type | Justification / Finding |
| :--- | :--- | :--- |
| `src/app/layout.js` | **Server Component** | Injects root metadata, fonts, and theme inline script; wraps tree in `CareerProvider`. |
| `src/app/page.js` | **Client Component** | Consumes `useCareer()`, renders interactive rapid diagnostic, live ticker, and persona picker. |
| `src/app/portfolio/[username]/page.js` | **Server Component** | Directly fetches user profile data from Supabase/fallbacks; renders statically shareable HTML. |
| `src/app/portfolio/page.js` | **Server Component** | Static server-side redirect to `/portfolio/sharvin`. |
| `src/app/analytics/page.js` | **Client Component** | Consumes `useCareer()` to compute velocity and dynamic charts. |
| `src/app/job-tracker/page.js` | **Client Component** | Interactive drag-and-drop / stage movement Kanban with live modal forms. |
| `src/app/salary-insights/page.js` | **Client Component** | Interactive compensation calculator with dynamic equity growth sliders. |
| `src/app/algorithm-sandbox/page.js` | **Client Component** | Interactive math canvas, gradient descent simulation, and FlashAttention calculators. |
| `src/app/skills/page.js` | **Client Component** | Interactive radar view and competency delta filters. |
| `src/app/projects/page.js` | **Client Component** | Interactive project case study ledger with status filters and milestone drawer. |
| `src/app/coding-tracker/page.js` | **Client Component** | Interactive problem tracker with category filters and completion toggles. |
| `src/app/ats-checker/page.js` | **Client Component** | Interactive text analysis, keyword matcher, and project evidence injector. |
| `src/app/interview-prep/page.js` | **Client Component** | Interactive question bank with category accordion and company filters. |
| `src/app/mock-interview/page.js` | **Client Component** | Interactive question timer, code evaluation simulation, and grading. |
| `src/app/cover-letter/page.js` | **Client Component** | Interactive STAR prompt builder and template generator. |
| `src/app/certifications/page.js` | **Client Component** | Interactive certification card deck with status filter and upload modal. |
| `src/app/resources/page.js` | **Client Component** | Interactive paper/reading index with status checkboxes and rating stars. |
| `src/app/resume-builder/page.js` | **Client Component** | Live preview ATS resume builder with JSON resume import/export. |
| `src/app/github/page.js` | **Client Component** | GitHub repo import scanner with branch and language breakdown. |
| `src/app/project-generator/page.js` | **Client Component** | Step-by-step STAR architectural blueprint generator. |

---

## 3. State Architecture & Data Flow

### 3.1 Global State Provider (`CareerContext.js`)
`CareerProvider` acts as an in-memory client-side cache and calculation engine. It manages:
- `activePersonaId`: The current demo persona ID (`sharvin_ml`, `elena_rag`, `marcus_lakehouse`).
- `userProfile`: Candidate metadata (name, target role, title, bio).
- `skills`: Array of competencies with proficiency (0–100) and evidence tier.
- `projects`: Array of case studies with demonstrated skills.
- `jobs`: Active job application pipeline.
- `readiness`: Computed object containing composite score (0–100), sub-category breakdown, and prioritized skill gaps.
- `nextBestAction`: Highest-leverage engineering action derived dynamically via utility scoring.

### 3.2 Dual-State Synchronization Divergence (Architectural Risk)
There is a significant architectural asymmetry in how pages communicate with the database:
1. **Context-Connected Pages**: `/`, `/analytics`, `/skills`, `/projects`, `/ats-checker`, `/job-tracker`, `/interview-prep`, `/project-generator`, `/resume-builder`, `/github` read and write through `CareerContext`.
2. **Context-Disconnected Pages**: `/certifications`, `/coding-tracker`, `/cover-letter`, `/mock-interview`, `/resources`, `/salary-insights` bypass `CareerContext`, making standalone `fetch('/api/...')` calls and managing their own local `useState`.
3. **Impact**: Mutating certifications, coding problems, or resources does not trigger updates in `CareerContext` readiness calculations until a full page reload or persona reset occurs.

---

## 4. Security & Serverless Layer Architecture

```
Incoming Request → [Request Size Guard (100KB)]
                 → [Field Whitelist Filter]
                 → [XSS & Control Char Sanitizer]
                 → [Enum & Range Validation]
                 → [Database Handler]
                 → [Security Event Logger (fs.appendFile)] ⚠️ Vercel Read-Only Issue
```

### Critical Security Findings in Architecture:
1. **Serverless Filesystem Logging**: `src/lib/security.js` uses `fs.appendFileSync(path.join(process.cwd(), 'logs', 'security.log'))`. On Vercel Lambda functions, the file system is read-only. This causes silent logger failures during security event logging.
2. **Top-Level `node:dns` Import in `supabase.js`**: `import dns from 'node:dns'` is executed at module top level. While wrapped in a `try/catch`, it introduces Node.js runtime coupling into what should be an environment-agnostic Supabase client.
3. **Hardcoded Fallback Credentials**: `src/lib/supabase.js` embeds a default Supabase Project URL and Anon JWT key directly in source code if environment variables are missing.
