# 04 — Feature Inventory: Catalyst OS

A complete inventory and operational classification of all features implemented across Catalyst OS.

---

## 1. Feature Classification Matrix

| Feature Name | Files Responsible | Components Involved | Supabase / Backend Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Interactive Persona Calibration** | `CareerContext.js`, `page.js`, `Sidebar.js` | `<Sidebar />`, Persona Pills | In-Memory `DEMO_PERSONAS` + `localStorage` | **Fully Functional** |
| **Unified Readiness Score** | `careerGraph.js`, `CareerContext.js`, `page.js` | Progress rings, Stat cards | Multi-factor calculation formula | **Fully Functional** |
| **Next Best Action Engine** | `careerGraph.js`, `CareerContext.js`, `page.js` | Hero CTA block | In-memory utility optimizer | **Fully Functional** |
| **Live Telemetry Ticker** | `LiveTelemetryTicker.js`, `page.js` | `<LiveTelemetryTicker />` | Client-side timer & benchmark dataset | **Fully Functional** |
| **Inference Latency Visualizer** | `BenchmarkLatencyVisualizer.js` | `<BenchmarkLatencyVisualizer />` | Interactive mathematical formulas | **Fully Functional** |
| **Rapid Technical Diagnostic** | `page.js` | Dropdowns & Run button | Client-side calculation | **Fully Functional** |
| **Pipeline Kanban Board** | `job-tracker/page.js`, `api/jobs/route.js` | Kanban columns, Modals | `job_applications`, `activity_log` | **Fully Functional** |
| **Rejection-to-Skill Loop** | `job-tracker/page.js`, `CareerContext.js` | Rejection feedback modal | In-memory `skills` update | **Fully Functional** |
| **Compensation & Equity Modeler** | `salary-insights/page.js`, `CompensationEquityModeler.js` | `<CompensationEquityModeler />` | `salary_benchmarks` table | **Fully Functional** |
| **Cover Letter Pitch Studio** | `cover-letter/page.js`, `api/cover-letter/route.js` | Pitch preview & generator | `cover_letters`, `projects` | **Fully Functional** |
| **ATS Resume Scanner** | `ats-checker/page.js`, `api/ats-checker/route.js` | Matcher cards & score dial | `resume_checks`, `projects` | **Fully Functional** |
| **Project Evidence Injector** | `ats-checker/page.js`, `CareerContext.js` | `[Inject →]` buttons | In-memory resume & projects | **Fully Functional** |
| **Mock Interview Assessment** | `mock-interview/page.js`, `api/mock-interview/route.js` | Timer, code editor, rubric | `mock_interview_sessions` | **Fully Functional** |
| **System Design Question Bank** | `interview-prep/page.js`, `api/interview-prep/route.js` | Category accordions, filters | `interview_questions`, `user_question_progress` | **Fully Functional** |
| **Gradient Descent Simulator** | `algorithm-sandbox/page.js` | HTML5 2D Canvas | Client-side calculus engine | **Fully Functional** |
| **FlashAttention IO Calculator** | `algorithm-sandbox/page.js` | Interactive sliders & formulas | Client-side math formulas | **Fully Functional** |
| **VRAM / KV-Cache Estimator** | `algorithm-sandbox/page.js` | Memory footprint bar charts | Client-side parameter models | **Fully Functional** |
| **Coding Problem Ledger** | `coding-tracker/page.js`, `api/coding-tracker/route.js` | Problem table, Pattern tags | `coding_problems`, `coding_profiles` | **Fully Functional** |
| **Competency Gap Map** | `skills/page.js`, `api/skills/route.js` | Skill bars, Evidence badges | `skills`, `activity_log` | **Fully Functional** |
| **Case Studies & Milestones** | `projects/page.js`, `api/projects/route.js` | Milestone drawers, Project cards | `projects`, `project_milestones` | **Partially Degraded** *(API 500 error)* |
| **STAR Project Blueprint Gen** | `project-generator/page.js`, `api/project-generator/route.js`| Blueprint card generator | `project_milestones`, `projects` | **Fully Functional** |
| **Credential Archive** | `certifications/page.js`, `api/certifications/route.js` | Certification deck, Upload modal | `certifications`, `activity_log` | **Fully Functional** |
| **Reading & Paper Index** | `resources/page.js`, `api/resources/route.js` | Paper cards, Rating stars | `resources`, `activity_log` | **Fully Functional** |
| **ATS Resume Builder & Export**| `resume-builder/page.js`, `api/resume/route.js` | Multi-section form, Live preview | `resumes`, `certifications`, `skills` | **Fully Functional** |
| **GitHub Repo Scanner & Import**| `github/page.js`, `api/github/route.js` | GitHub scanner, Language bars | `github_analyses`, `projects` | **Fully Functional** |
| **Public Portfolio Showcase** | `portfolio/[username]/page.js` | Shareable portfolio page | Direct Supabase fetch + fallbacks | **Fully Functional** |
| **Command Palette (Quick Nav)** | `CommandPalette.js` | `<CommandPalette />` (`Cmd+K`) | In-memory routes & actions | **Fully Functional** |
| **Theme Toggle (500ms Smooth)**| `ThemeToggle.js`, `globals.css` | `<ThemeToggle />` | `localStorage` (`catalyst-theme`) | **Fully Functional** |
| **First-Time Onboarding Wizard**| `OnboardingModal.js` | `<OnboardingModal />` | `localStorage` (`catalyst_onboarded`)| **Fully Functional** |
| **Full System Backup / Restore**| `api/backup/route.js`, `Sidebar.js` | JSON export & restore handler | All 12 Supabase database tables | **Fully Functional** |

---

## 2. Feature Anomaly & Degradation Details

### Anomaly: `projects/page.js` vs. `/api/projects`
- **Issue**: When `/projects` mounts, the page attempts to fetch live project milestones from `/api/projects`.
- **Root Cause**: `src/app/api/projects/route.js` line 82 references an uninitialized variable `projectsWithMilestones`, causing a `ReferenceError` and an HTTP 500 response.
- **Graceful Degradation Behavior**: The frontend catches the fetch error and falls back to `CareerContext.projects` (in-memory demo data). As a result, the UI appears functional to casual users, but live database saving/loading is broken on this route.

### Anomaly: Standalone Sub-App State Silos
- **Issue**: `/certifications`, `/coding-tracker`, `/resources`, and `/salary-insights` perform direct API mutations that do not synchronize back into the parent `CareerContext` readiness formula.
- **User Impact**: Earning a new certification or solving 10 coding problems does not immediately update the global Readiness Score in the sidebar until a full page reload or persona reset is executed.
