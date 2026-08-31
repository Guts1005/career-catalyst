# 06. Route Verification Matrix (All 40 Routes)

## 1. Overview

Every route (18 frontend pages + 22 API endpoints) was verified in the production build and inspected across desktop and mobile layouts.

---

## 2. Frontend Route Verification Matrix

| Route | Type | Desktop (1440px) | Mobile (375px) | Primary Action / Feature | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Static | PASS | PASS | Candidate Persona Selection & Executive KPI Dashboard | **PASS** |
| `/analytics` | Static | PASS | PASS | Competency Radar & Readiness Velocity Modeler | **PASS** |
| `/job-tracker` | Static | PASS | PASS | Drag-and-Drop Pipeline Kanban Board | **PASS** |
| `/salary-insights` | Static | PASS | PASS | Interactive RSU/Bonus Compensation Modeler | **PASS** |
| `/cover-letter` | Static | PASS | PASS | Evidence-Backed Cover Letter Synthesizer | **PASS** |
| `/ats-checker` | Static | PASS | PASS | Resume-to-JD Keyword Matcher & +INJECT Proof | **PASS** |
| `/mock-interview` | Static | PASS | PASS | Multi-Track System Design Timer & Audio Prompts | **PASS** |
| `/interview-prep` | Static | PASS | PASS | Flashcard Revision Bank & Filtered Practice | **PASS** |
| `/algorithm-sandbox` | Static | PASS | PASS | Triton vs vLLM vs PyTorch Latency Benchmarker | **PASS** |
| `/coding-tracker` | Static | PASS | PASS | Algorithmic Problem Solving & Mastery Matrix | **PASS** |
| `/skills` | Static | PASS | PASS | Competency Roadmap & Evidence Tier Progression | **PASS** |
| `/projects` | Static | PASS | PASS | Hopper/Triton Portfolio Showcase with Milestones | **PASS** |
| `/project-generator` | Static | PASS | PASS | System Architecture Blueprint Generator | **PASS** |
| `/certifications` | Static | PASS | PASS | Cloud & ML Credential Roadmap & Progress Sync | **PASS** |
| `/resources` | Static | PASS | PASS | Deep Learning arXiv Library with Quick Search (`/`) | **PASS** |
| `/resume-builder` | Static | PASS | PASS | JSON Resume Canvas & PDF Export Engine | **PASS** |
| `/github` | Static | PASS | PASS | GitHub Repository Proof Synchronization | **PASS** |
| `/portfolio` | Static | PASS | PASS | Public Showcase Directory & Quick Links | **PASS** |
| `/portfolio/[username]`| Dynamic | PASS | PASS | Public Candidate Profile SSR View | **PASS** |
| `/_not-found` | Static | PASS | PASS | Clean 404 Fallback View with Dashboard Return | **PASS** |

---

## 3. Backend API Route Verification Matrix

| Route | Method | Handled Payload / Query | Verified Status |
| :--- | :--- | :--- | :--- |
| `/api/analytics` | GET | Aggregates readiness, skills, and pipeline velocity | **PASS** |
| `/api/ats-checker` | GET, POST | Extracts JD keywords & matches resume evidence | **PASS** |
| `/api/ats-checker/[id]` | GET, DELETE | Manages stored ATS scan history | **PASS** |
| `/api/backup` | GET, POST | Exports/imports JSON Resume backups | **PASS** |
| `/api/certifications` | GET, POST | Lists and creates certification credentials | **PASS** |
| `/api/certifications/[id]` | GET, PUT, DELETE | Manages specific certification progress | **PASS** |
| `/api/coding-tracker` | GET, POST | Lists and logs solved coding problems | **PASS** |
| `/api/coding-tracker/[id]` | GET, PUT, DELETE | Manages specific problem status & notes | **PASS** |
| `/api/cover-letter` | POST | Generates tailored cover letter text | **PASS** |
| `/api/dashboard` | GET | Aggregates high-level metrics for overview | **PASS** |
| `/api/github` | GET | Fetches connected GitHub repository statuses | **PASS** |
| `/api/github/[id]` | GET, DELETE | Manages specific repository connection | **PASS** |
| `/api/github/import` | POST | Imports GitHub repositories into portfolio | **PASS** |
| `/api/interview-prep` | GET, POST | Question bank query & flashcard rating update | **PASS** |
| `/api/interview-prep/[id]` | GET, PUT, DELETE | Manages specific interview questions | **PASS** |
| `/api/jobs` | GET, POST | Manages job applications Kanban pipeline | **PASS** |
| `/api/jobs/[id]` | GET, PUT, DELETE | Updates application stages (applied/interview/offer) | **PASS** |
| `/api/mock-interview` | GET, POST | Generates mock interview evaluation reports | **PASS** |
| `/api/project-generator` | GET, POST | Synthesizes project architecture blueprints | **PASS** |
| `/api/projects` | GET, POST | Lists Hopper projects and creates new entries | **PASS** |
| `/api/projects/[id]` | GET, PUT, DELETE | Project detail query & metadata editing | **PASS** |
| `/api/projects/[id]/milestones` | GET, POST | Granular milestone tasks management | **PASS** |
| `/api/readiness` | GET | Canonical multi-factor readiness evaluation | **PASS** |
| `/api/resources` | GET, POST | arXiv research paper library with caching | **PASS** |
| `/api/resources/[id]` | GET, PUT, DELETE | Manages reading progress & paper bookmarks | **PASS** |
| `/api/resume` | GET, POST | JSON resume data retrieval and auto-save | **PASS** |
| `/api/salary-insights` | GET, POST | Market salary benchmarks with caching | **PASS** |
| `/api/skills` | GET, POST | Competency inventory & evidence verification | **PASS** |
| `/api/skills/[id]` | GET, PUT, DELETE | Manages specific skill target levels | **PASS** |
