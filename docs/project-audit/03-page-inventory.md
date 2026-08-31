# 03 — Page Inventory: Catalyst OS

A complete inventory of all 18 routes implemented in the Catalyst OS Next.js application.

---

## 1. Route Matrix & Operational Status

| Route | Page Title | Primary User | Primary Action | Data Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Overview & Telemetry | Candidate / Evaluator | Calibrate career track & view readiness telemetry | `CareerContext` (In-memory + API sync) | **Fully Functional** |
| `/analytics` | Career Analytics | Candidate | Inspect conversion funnel, velocity, & skill growth | `CareerContext` (Readiness, Jobs, Skills) | **Fully Functional** |
| `/job-tracker` | Pipeline & Kanban | Job Seeker | Manage application stages & log interview outcomes | `CareerContext`, `/api/jobs` | **Fully Functional** |
| `/salary-insights` | Salary Intelligence | Job Seeker | Benchmark compensation & simulate equity growth | `/api/salary-insights`, Local state | **Fully Functional** |
| `/cover-letter` | Cover Pitch Studio | Job Seeker | Generate STAR cover letters & recruiter pitches | `/api/cover-letter`, Local state | **Fully Functional** |
| `/ats-checker` | ATS Scanner | Job Seeker | Scan resume against job description & inject project proof | `CareerContext`, `/api/ats-checker` | **Fully Functional** |
| `/mock-interview` | Mock Assessment | Candidate | Simulate timed technical assessment & receive rubric scores | `/api/mock-interview`, Local state | **Fully Functional** |
| `/interview-prep` | Question Bank | Candidate | Practice system design & domain questions | `CareerContext`, `/api/interview-prep` | **Fully Functional** |
| `/algorithm-sandbox`| Math Sandbox | ML Engineer | Simulate gradient descent, attention scaling, & memory | Client-side math algorithms | **Fully Functional** |
| `/coding-tracker` | Coding Ledger | Candidate | Track algorithmic problem solving & patterns | `/api/coding-tracker`, Local state | **Fully Functional** |
| `/skills` | Skill Gap Map | Candidate | Analyze competency deltas vs. role hiring bars | `CareerContext`, `/api/skills` | **Fully Functional** |
| `/projects` | Case Studies | Recruiter / Candidate | Review verified architectural case studies & milestones | `CareerContext`, `/api/projects` | **Partially Degraded** *(Backend API 500 bug)* |
| `/project-generator`| System Blueprints | Candidate | Generate STAR-format project blueprints for resume gaps | `CareerContext`, `/api/project-generator` | **Fully Functional** |
| `/certifications` | Credential Archive | Candidate | Track certification deadlines, status, & credentials | `/api/certifications`, Local state | **Fully Functional** |
| `/resources` | Reading Index | Engineer | Curate papers, RFCs, and engineering blogs with ratings | `/api/resources`, Local state | **Fully Functional** |
| `/resume-builder` | ATS Resume | Job Seeker | Build ATS-compliant resumes and export JSON/LaTeX | `CareerContext`, `/api/resume` | **Fully Functional** |
| `/github` | GitHub Sync | Engineer | Analyze GitHub repositories and import verified projects | `CareerContext`, `/api/github` | **Fully Functional** |
| `/portfolio/[user]`| Public Showcase | Recruiter / Hiring Mgr | View verified public candidate proof, repos, and bio | Server-side Supabase / Mock Fallback | **Fully Functional** |
| `/portfolio` | Portfolio Redirect | Any Visitor | Redirects to default candidate `/portfolio/sharvin` | Static redirect | **Fully Functional** |

---

## 2. Detailed Route Breakdowns

### 1. `/` (Overview Command Center)
- **Path**: `src/app/page.js` (`use client`, 359 lines)
- **Components**: `Sidebar`, `LiveTelemetryTicker`, `BenchmarkLatencyVisualizer`, `OnboardingModal`, `Toast`
- **User Actions**: Switch demo personas (Sharvin, Elena, Marcus), toggle theme, launch career diagnostic, view Next Best Action, inspect latency visualizer.
- **Mobile Usability**: Bottom `<MobileNav />` with sticky header and horizontal persona pills.

### 2. `/analytics` (Career Telemetry & Funnel)
- **Path**: `src/app/analytics/page.js` (`use client`, 225 lines)
- **Components**: `PageHeader`, `Icons`
- **User Actions**: Review overall readiness breakdown (30% Skills, 30% Portfolio, 20% Resume, 20% Applications), application conversion funnel (Applied ➔ OA ➔ Interview ➔ Offer), and weekly study velocity.
- **UX Highlights**: Clean SVG progress rings and bar charts.

### 3. `/job-tracker` (Pipeline Kanban)
- **Path**: `src/app/job-tracker/page.js` (`use client`, 616 lines)
- **Components**: `PageHeader`, `Icons`, `Toast`
- **User Actions**: Drag-and-drop or click to move applications across 6 columns (`Wishlist`, `Applied`, `Online Assessment`, `Technical Interview`, `Final Round`, `Offer`). Add/edit modal with salary, required skills, and recruiter contact.
- **Inter-feature Loop**: Moving to 'Rejected' triggers the feedback modal to update the Skill Gap Map.

### 4. `/salary-insights` (Salary Intelligence)
- **Path**: `src/app/salary-insights/page.js` (`use client`, 263 lines)
- **Components**: `PageHeader`, `CompensationEquityModeler`, `Icons`
- **User Actions**: Select role and location to view base, equity, and bonus percentiles (P25, P50, P75, P90). Run 4-year equity appreciation simulation with strike price and exit valuation sliders.

### 5. `/cover-letter` (Cover Pitch Studio)
- **Path**: `src/app/cover-letter/page.js` (`use client`, 244 lines)
- **Components**: `PageHeader`, `Icons`, `Toast`
- **User Actions**: Select target company, role, tone (Technical, Executive, Direct), and extract relevant project STAR points into a copyable recruiter pitch.

### 6. `/ats-checker` (ATS Scanner)
- **Path**: `src/app/ats-checker/page.js` (`use client`, 357 lines)
- **Components**: `PageHeader`, `Icons`, `Toast`
- **User Actions**: Paste target Job Description; computes keyword density match, flags missing critical skills, and provides a 1-click button to inject verified project proof into the resume.

### 7. `/mock-interview` (AI Assessment Simulator)
- **Path**: `src/app/mock-interview/page.js` (`use client`, 269 lines)
- **Components**: `PageHeader`, `Icons`
- **User Actions**: Select track, start timed question assessment, enter code/architecture response, receive instant evaluation scores across Correctness, Time Complexity, and System Design.

### 8. `/interview-prep` (Technical Question Bank)
- **Path**: `src/app/interview-prep/page.js` (`use client`, 340 lines)
- **Components**: `PageHeader`, `Icons`, `Toast`
- **User Actions**: Filter 20+ ML/systems questions by company (Anthropic, NVIDIA, OpenAI, Meta), difficulty, and topic. Mark questions as Mastered, Review, or Unattempted.

### 9. `/algorithm-sandbox` (Math & Attention Sandbox)
- **Path**: `src/app/algorithm-sandbox/page.js` (`use client`, 450 lines)
- **Components**: `PageHeader`, `Icons`
- **User Actions**: Interactive mathematical simulations:
  1. *Gradient Descent Simulator*: Tune learning rate and momentum with live canvas trajectory plotting.
  2. *FlashAttention IO Complexity Calculator*: Visualizes $O(N^2)$ HBM memory roundtrips vs. $O(N)$ SRAM tile-fused attention.
  3. *LLM VRAM & KV-Cache Footprint Estimator*: Computes model parameter and activation memory requirements across FP16, FP8, and INT4.

### 10. `/coding-tracker` (Algorithmic Problem Ledger)
- **Path**: `src/app/coding-tracker/page.js` (`use client`, 462 lines)
- **Components**: `PageHeader`, `Icons`, `Toast`
- **User Actions**: Log LeetCode/NeetCode problems, track patterns (Sliding Window, Monotonic Stack, Two Pointers), notes, and time-to-solve.

### 11. `/skills` (Skill Gap Map)
- **Path**: `src/app/skills/page.js` (`use client`, 339 lines)
- **Components**: `PageHeader`, `Toast`
- **User Actions**: View competency radar vs. target role baseline, filter by evidence tier, and inspect high-priority deficit deltas.

### 12. `/projects` (Case Studies Ledger)
- **Path**: `src/app/projects/page.js` (`use client`, 355 lines)
- **Components**: `PageHeader`, `BenchmarkLatencyVisualizer`, `Toast`
- **User Actions**: Filter architectural case studies, inspect milestone completion, launch demo links, and link GitHub repositories.
- **Known Issue**: Live API `/api/projects` returns 500 due to undefined `projectsWithMilestones` variable in `route.js`; UI gracefully falls back to `CareerContext` in-memory demo data.

### 13. `/project-generator` (System Blueprints)
- **Path**: `src/app/project-generator/page.js` (`use client`, 164 lines)
- **Components**: `PageHeader`, `Icons`, `Toast`
- **User Actions**: Generates end-to-end architectural project blueprints (Situation, Task, Action, Result) targeted at closing specific resume skill gaps.

### 14. `/certifications` (Verified Credentials)
- **Path**: `src/app/certifications/page.js` (`use client`, 449 lines)
- **Components**: `PageHeader`, `Toast`
- **User Actions**: Manage certification status (Completed, In Progress, Planned), credential URLs, and study progress.

### 15. `/resources` (Reading Index)
- **Path**: `src/app/resources/page.js` (`use client`, 436 lines)
- **Components**: `PageHeader`, `Toast`
- **User Actions**: Index foundational ML papers (Attention Is All You Need, FlashAttention-2, Llama 3, LoRA), star ratings, and key takeaways.

### 16. `/resume-builder` (ATS Resume Builder)
- **Path**: `src/app/resume-builder/page.js` (`use client`, 483 lines)
- **Components**: `PageHeader`, `Icons`, `Toast`
- **User Actions**: Edit work experience, education, skills, and projects in real time. Exports JSON Resume (`resume.json`) or plain text.

### 17. `/github` (GitHub Sync)
- **Path**: `src/app/github/page.js` (`use client`, 382 lines)
- **Components**: `PageHeader`, `Icons`, `Toast`
- **User Actions**: Scan GitHub user profile (`Guts1005`), analyze repositories, extract language percentages, and 1-click import into verified projects.

### 18. `/portfolio/[username]` (Public Recruiter Showcase)
- **Path**: `src/app/portfolio/[username]/page.js` (Server Component, 153 lines)
- **Components**: `ShareProfileButton`, `Icons`
- **User Actions**: Read-only public portfolio view for hiring managers showing verified case studies, competencies, and GitHub links.
