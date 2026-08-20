# CATALYST OS — The Connected Career Operating System for ML & Data Systems

<div align="center">

```
   ______      __        __            __     ____  _____
  / ____/___ _/ /_____ _/ /_  ______  / /_   / __ \/ ___/
 / /   / __ `/ __/ __ `/ / / / / ___// __/  / / / /\__ \ 
/ /___/ /_/ / /_/ /_/ / / /_/ (__  )/ /_   / /_/ /___/ / 
\____/\__,_/\__/\__,_/_/\__, /____/ \__/   \____//____/  
                       /____/                             
```

**An Editorial, Architectural & Data-Driven Career Intelligence Platform for Machine Learning Engineers, AI Architects, and Data Systems Specialists.**

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.1-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Turbopack](https://img.shields.io/badge/Bundler-Turbopack-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://turbo.build/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-black?style=for-the-badge)](LICENSE)
[![Design](https://img.shields.io/badge/Aesthetics-Editorial%20×%20Minimal-000000?style=for-the-badge)]()

[Live Demo Deployment](https://career-catalyst.dev) • [Architecture](#-system-architecture) • [Core Pillars](#-core-architectural-pillars) • [Security](#-security--defense-in-depth)

</div>

---

## 🏛️ Executive Summary

**Catalyst OS** is not a collection of fragmented career widgets. It is a **connected Career Operating System** built to replace generic SaaS dashboards with an architectural, high-signal workspace.

Traditional candidate portfolios rely on self-reported claims. **Catalyst OS** enforces an **evidence-based graph**:
1. Every claimed skill must be backed by a **verified GitHub repository, benchmarked project artifact, or formal assessment**.
2. Every job application connects to an **active ATS keyword scan** and **interview preparation bank**.
3. Rejection feedback dynamically feeds back into the **Skill Gap Map** to reprioritize interview focus.
4. A reactive **Next Best Action Engine** continuously answers: *"What is the single highest-ROI engineering move I should make today?"*

---

## 🧠 System Architecture

```
                                 ┌─────────────────────────────────────────┐
                                 │            USER CAREER PROFILE          │
                                 │ (Target Role, Seniority, Target Comp)   │
                                 └────────────────────┬────────────────────┘
                                                      │
                                                      ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                      CANONICAL CAREER GRAPH ENGINE                                     │
 │                                        (src/lib/careerGraph.js)                                        │
 └───────┬──────────────────────────┬──────────────────────────┬───────────────────────────┬──────────────┘
         │                          │                          │                           │
         ▼                          ▼                          ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐       ┌───────────────────┐
│  COMPETENCY MAP  │       │ EVIDENCE ENGINE  │       │ PIPELINE KANBAN  │       │ ATS KEYWORD LOOP  │
│  6 Tracks/Roles  │       │ 4 Proof Tiers    │       │ Active Stages    │       │ Project Keyword   │
│  Dynamic Deltas  │       │ Repo & Project   │       │ Rejection Feed   │       │ Cross-Referencing │
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘       └─────────┬─────────┘
         │                          │                          │                           │
         └──────────────────────────┼──────────────────────────┴───────────────────────────┘
                                    ▼
       ┌──────────────────────────────────────────────────────────────┐
       │             MULTI-FACTOR READINESS & ACTION ENGINE           │
       │                                                              │
       │   Readiness = 0.30(Skills) + 0.30(Portfolio Evidence)        │
       │             + 0.20(ATS Resume) + 0.20(Interview Velocity)    │
       │                                                              │
       │   Priority Score = (Impact × Relevance × Urgency) / Effort   │
       └────────────────────────────┬─────────────────────────────────┘
                                    ▼
       ┌──────────────────────────────────────────────────────────────┐
       │                    REACTIVE CLIENT CONTEXT                   │
       │                  (src/context/CareerContext.js)              │
       └────────────────────────────┬─────────────────────────────────┘
                                    │
    ┌───────────────────────┬───────┴───────────────┬────────────────────────┐
    ▼                       ▼                       ▼                        ▼
[Overview & KPI]     [Question Bank]       [Public Showcase]        [Mobile Drawer]
/ (Landing Page)     /interview-prep       /portfolio/[user]        <MobileNav />
```

---

## ⚡ Core Architectural Pillars

### 1. The Canonical Career Graph (`src/lib/careerGraph.js`)
* **Role Hierarchies**: Pre-calibrated rubrics across 6 specialized tracks:
  - *Associate Data Scientist* (Python, SQL, Pandas, Scikit-Learn, Statistical Testing)
  - *Junior ML Engineer* (PyTorch, Docker, FastAPI, CI/CD, Model Serving)
  - *Machine Learning Engineer* (PyTorch & CUDA, MLOps, Distributed Systems, Triton)
  - *AI Application Engineer* (Multi-Modal RAG, Vector Search, FAISS/Milvus, DSPy)
  - *Data Systems Engineer* (Lakehouse, Kafka Streaming, Apache Spark, dbt, Snowflake)
  - *Staff ML Systems Architect* (CUDA Kernels, Multi-GPU Cluster Scaling, Platform Design)
* **4-Tier Evidence Hierarchy**:
  - `CLAIM` (Weight: 0.35) — Self-reported text without verifiable evidence.
  - `ASSESSED` (Weight: 0.65) — Validated through technical quiz or mock interview simulator.
  - `PROJECT` (Weight: 0.85) — Documented architectural case study with benchmarked metrics.
  - `VERIFIED` (Weight: 1.00) — Backed by a live GitHub repository codebase with unit tests.

### 2. Multi-Factor Readiness Algorithm
$$\text{Readiness} = 0.30 \cdot S_{\text{skills}} + 0.30 \cdot P_{\text{portfolio}} + 0.20 \cdot R_{\text{resume}} + 0.20 \cdot V_{\text{pipeline}}$$

Where:
* $S_{\text{skills}}$ is the weighted proficiency against the target role's core competencies.
* $P_{\text{portfolio}}$ is the percentage of required capabilities backed by verified case studies.
* $R_{\text{resume}}$ is the ATS keyword density and formatting score.
* $V_{\text{pipeline}}$ is the active application velocity and technical interview momentum.

### 3. Continuous Next Best Action Engine
Prioritizes the candidate's immediate high-leverage move using the objective utility function:
$$\text{Score} = \frac{\text{Impact} \times \text{Relevance} \times \text{Urgency}}{\text{Effort}}$$
* Automatically triggers interview system design prep if a company is in the `Interview` stage.
* Suggests highest-ROI project case studies if critical skills lack codebase proof.
* Highlights specific skill deltas where candidate proficiency falls below the target hiring bar.

### 4. Inter-Feature Feedback Loops
* **Project → Skill Evidence**: Adding a case study with demonstrated skills automatically upgrades those competencies from `CLAIM` to `PROJECT` or `VERIFIED`.
* **ATS Scanner → Portfolio Proof**: Cross-references missing keywords against existing projects. If a skill exists in a project repo but is omitted from the resume, the scanner flags: *"💡 Verified in Triton Gateway, but missing from resume text [Inject →]"*.
* **Rejection Feedback → Skill Gap**: Moving an application to `Archived / Outcome` prompts a feedback modal (e.g. *System Design*), automatically elevating that topic on the candidate's radar.
* **Public Recruiter Showcase**: Zero data duplication. Direct projection of internal verified projects, credentials, and code repositories to `/portfolio/[username]`.

---

## 🎨 Design System & Aesthetics

```
EDITORIAL × MINIMAL × TECHNICAL × DATA-DRIVEN × DAY/NIGHT HARMONY
```

* **Typography**: Clean hierarchy utilizing `Geist Sans` for structural typography and `Geist Mono` for technical invariants, telemetry numbers, and code blocks.
* **Color Palette**: High-contrast architectural monochrome with purposeful semantic accents (`--green` for verified proof, `--amber` for skill deltas, `--purple` for active interview rounds).
* **Coordinated 500ms Dark Mode**: Zero-flash theme initialization via inline head script, unified semantic CSS variables, and persistent local state.
* **Mobile-First Ergonomics**: Dedicated `<MobileNav />` bottom navigation with 48px+ touch targets, sliding bottom-sheet directory, safe-area inset compliance, and responsive modal sheets.

---

## 🛡️ Security & Defense-in-Depth

Every API endpoint adheres to strict security middleware (`src/lib/security.js`):
* **Strict Whitelisting**: Request payloads are stripped of unexpected fields prior to query construction.
* **XSS Sanitization**: HTML entity encoding on all user-supplied text inputs.
* **Payload Length Limits**: 100KB hard payload caps with 413 Payload Too Large safeguards.
* **Enum & Range Validation**: Strict boundary checks on proficiency values (0–100) and lifecycle stages.
* **Audit Event Logging**: In-memory security ledger recording blocked requests, missing required fields, and malformed bodies.

---

## 📦 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16.3.1 (App Router, Server & Client Components) |
| **Compiler** | Turbopack |
| **State Management** | React 19 Context (`CareerProvider`) + LocalStorage Persistence |
| **Database** | Supabase PostgreSQL + Fallback SQLite Architecture |
| **Styling** | CSS Modules + Custom Semantic Design Tokens |
| **Icons** | Custom Zero-Dependency Geometric SVG Icons |
| **Security** | Custom Input Sanitizer, Whitelist Validator, and Threat Logger |

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18.18+ or 20.x
* npm / pnpm / yarn

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/Guts1005/career-catalyst.git
cd career-catalyst

# 2. Install dependencies
npm install

# 3. Configure environment variables (.env.local)
cp .env.example .env.local
# Add your Supabase credentials (optional, falls back to cohesive benchmark data)

# 4. Start development server with Turbopack
npm run dev
```

Visit `http://localhost:3000` to launch the platform.

### Production Build
```bash
npm run build
npm run start
```

---

## 🗺️ Application Routes

```
/                         — Overview Command Center & Narrative
├── /analytics            — Career Telemetry, Funnel & Velocity
├── /job-tracker          — Application Pipeline & Stage Kanban
├── /salary-insights      — Salary Intelligence & Counter-Offer Generator
├── /cover-letter         — STAR Cover Letter & Recruiter Pitch Studio
├── /ats-checker          — ATS Keyword Scanner & Project Matcher
├── /mock-interview       — AI Technical Assessment & Grading Simulator
├── /interview-prep       — System Design & Technical Question Bank
├── /algorithm-sandbox    — Math Sandbox, Attention Scaling & GD Simulator
├── /coding-tracker       — Data Structures & Algorithmic Ledger
├── /skills               — Competency Radar & Skill Gap Map
├── /projects             — Portfolio Architecture & Case Studies
├── /project-generator    — STAR System Blueprints
├── /certifications       — Verified Credential Archive
├── /resources            — Technical Reading Index
├── /resume-builder       — ATS Resume Builder & LaTeX/JSON Export
├── /github               — GitHub Sync & Repository Ledger
└── /portfolio/[user]     — Public Recruiter Portfolio Showcase
```

---

## 📄 License

MIT © 2026 Sharvin Patel. Built with precision for the technical engineering community.
