# 04. Feature Ecosystem Analysis & Classification

## 1. Feature Inventory & Ecosystem Mapping

This document categorizes every major capability within Catalyst OS from the perspective of user value, action triggers, ecosystem connectivity, and product maturity.

---

## 2. Comprehensive Feature Matrix

| Feature | Classification | User Problem Solved | Visit Trigger | User Primary Action | System Response / Output | Ecosystem Connections |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Executive Dashboard (`/`)** | **CORE** | Fragmented status; unclear priorities | Daily check-in / first load | Review Readiness & Next Action | Recomputes live KPIs & gap deficit | Connects to ALL subsystems |
| **Readiness Engine** | **CORE** | Don't know if ready for Anthropic/NVIDIA | Evaluating hiring confidence | Inspect 4-pillar subscores | Outputs weighted 0–100 score + gaps | Skills, Projects, Resume, Jobs |
| **Skills Matrix (`/skills`)** | **CORE** | Unclear competency deficits for target role | Need roadmap to Senior ML | Upgrade evidence tiers (Claim ➔ Verified) | Closes gaps & updates career graph | Readiness, Projects, ATS |
| **Projects Showcase (`/projects`)** | **CORE** | Generic portfolio without engineering proof | Building concrete work evidence | Complete milestones; link repo | Attaches verified proof tags | ATS Checker, Portfolio, Skills |
| **ATS Checker (`/ats-checker`)** | **CORE** | Resumes filtered out by automated bots | Applying to target job posting | Match resume against JD; `+INJECT` | Calculates match % & inserts proof | Projects, Skills, Resume |
| **Job Pipeline (`/job-tracker`)** | **CORE** | Disorganized job hunt & missing deadlines | Tracking applications & interviews | Drag cards across Kanban stages | Updates Pipeline score & triggers prep | Interview Prep, Salary, Next Action |
| **Public Portfolio (`/portfolio`)** | **CORE OUTCOME**| Recruiters only see plain PDF resumes | Sharing profile with hiring managers | Copy public SSR link (`/portfolio/sharvin`) | Renders verified proof showcase | Projects, Skills, Certs |
| **Salary Insights (`/salary-insights`)**| **ADVANCED** | Lowballed in negotiation; equity confusion | Preparing offer negotiations | Model 4-year equity & bonuses | Generates negotiation leverage script | Job Tracker, Next Best Action |
| **Algorithm Sandbox (`/algorithm-sandbox`)**| **ADVANCED** | Need to prove deep CUDA/Triton knowledge | Interviewing for ML Systems | Drag batch & context sliders | Demonstrates 73% FP16 GPU speedup | Projects, Interview Prep |
| **Certifications (`/certifications`)** | **SUPPORTING** | Tracking cloud and ML credentials | Upskilling for distributed training | Log earned cert (AWS / NVIDIA DLI) | Dispatches `syncCertification` (+5 pts)| Readiness, Portfolio |
| **Coding Tracker (`/coding-tracker`)** | **SUPPORTING** | Forgetting solved algorithm solutions | Practicing technical coding rounds | Log solved problem & notes | Upgrades skill to `VERIFIED` | Skills, Readiness |
| **arXiv Library (`/resources`)** | **SUPPORTING** | Keeping up with latest architecture papers | Researching DeepSeek-V3 / FlashAttn | Bookmark & search papers (`/`) | Logs technical reading progress | Skills, Interview Prep |
| **Interview Prep (`/interview-prep`)** | **SUPPORTING** | Blanking out on system design rounds | 48h before technical interview | Flip flashcards & review takeaways | Tracks question mastery status | Job Tracker, Mock Interview |
| **Resume Builder (`/resume-builder`)** | **SUPPORTING** | Updating resume formatting manually | Exporting PDF for job submission | Edit JSON resume; live preview | Generates formatted PDF export | ATS Checker, Portfolio |
| **Project Generator (`/project-generator`)**| **ADVANCED** | Blank page syndrome for portfolio projects | Planning next engineering build | Select domain template & export plan | Synthesizes system architecture spec | Projects |
| **Mock Interview (`/mock-interview`)** | **EXPERIMENTAL**| Stage fright in live design interviews | Practicing under real-time pressure | Start timer & answer audio prompt | Generates evaluation report card | Interview Prep |
| **GitHub Sync (`/github`)** | **SUPPORTING** | Manual repo copy-pasting | Proving code ownership | Connect username & import repo | Validates repo existence & stats | Projects, Skills |

---

## 3. Isolated Demonstrations vs. Integrated Ecosystem

### Isolated Demonstrations (Need Stronger Ecosystem Anchors)
1. **Algorithm Sandbox (`/algorithm-sandbox`)**:
   * *Current State*: An impressive interactive GPU latency benchmark.
   * *Problem*: Exists as a standalone page; does not automatically link back to the candidate's Triton project card or the FlashAttention arXiv paper.
   * *Fix*: Embed the interactive benchmark directly inside the Triton project card in `/projects` as an interactive proof artifact.
2. **Salary Insights (`/salary-insights`)**:
   * *Current State*: A standalone compensation calculator.
   * *Problem*: Does not pre-fill current offer numbers from the candidate's active offers in `/job-tracker`.
   * *Fix*: Add a "Negotiate This Offer" button on `/job-tracker` cards that opens `/salary-insights` with pre-filled compensation parameters.
