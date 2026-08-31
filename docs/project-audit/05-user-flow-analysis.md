# 05 — User Flow Analysis: Catalyst OS

A rigorous end-to-end evaluation of all primary user journeys through the Catalyst OS platform.

---

## 1. First-Time User Experience (The "Day 0" Journey)

```
[Visitor Lands on https://ccsharvin.vercel.app/]
                    │
                    ▼
   [Inline Head Script checks 'catalyst-theme']
   (Applies Dark/Light instantly without flash)
                    │
                    ▼
     [Checks localStorage 'catalyst_onboarded']
          ┌─────────┴─────────┐
    (False)                 (True)
          ▼                   ▼
[Onboarding Modal]     [Overview Dashboard Mounts]
- Name & Target Role   - Live Telemetry Ticker Rotates
- Initial Skill Level  - Persona Selector Active (Sharvin Neve)
- Calibrate Baseline   - Readiness Gauge Shows 63%
          │            - Next Best Action Card Prominently Rendered
          ▼                   │
   [Profile Saved] ───────────┘
```

### Observations on First Impression:
- **Strengths**: Immediate architectural density. The live telemetry ticker (`P99 Triton Inference: 13.8ms on 8x H100`) immediately communicates deep systems credibility. The 3 candidate persona chips allow evaluators to instantly test the platform with realistic data.
- **Friction Points**: First-time users unfamiliar with ML systems metrics may experience cognitive overload from the dense technical acronyms (SXM5, HBM3, FlashAttention, FSDP) before understanding the basic career-tracking workflow.

---

## 2. Core Career Progression Loops

### Loop A: Competency Discovery & Evidence Verification
```
[Identify Skill Deficit in /skills] (e.g. CUDA Kernels: 40% vs 95% target)
                    │
                    ▼
[/resources: Read Research Papers] (e.g. FlashAttention-2 RFC / Tri Dao)
                    │
                    ▼
[/project-generator: Generate STAR Blueprint] (e.g. SRAM-Tiled Attention Kernel)
                    │
                    ▼
[/github: Import Verified Repository Codebase] (e.g. Guts1005/triton-gateway)
                    │
                    ▼
[Evidence Upgraded from CLAIM (0.35) ➔ VERIFIED (1.00)]
                    │
                    ▼
[Global Readiness Score Increases Automatically]
```

### Loop B: Job Application & Closed-Loop ATS Optimization
```
[Target Role Found] ──► [/job-tracker: Added to Kanban as 'Wishlist']
                                       │
                                       ▼
                     [/ats-checker: Paste Job Description & Run Matcher]
                                       │
                                       ▼
                     [Scanner identifies missing keywords in Resume]
                                       │
                                       ▼
                     [1-Click 'Inject Project Proof' button pushes verified code]
                                       │
                                       ▼
                     [/cover-letter: Generate Tailored STAR Recruiter Pitch]
                                       │
                                       ▼
                     [Application moves to 'Applied' ➔ 'Interview']
                                       │
                      ┌────────────────┴────────────────┐
                 (Outcome: Offer)               (Outcome: Rejected)
                      ▼                                 ▼
         [/salary-insights: Equity Modeler]    [Rejection Reason Logged]
                                                        ▼
                                       [Skill Gap Automatically Added to /skills]
```

---

## 3. Recruiter & Hiring Manager Journey (`/portfolio/[username]`)

1. Recruiter arrives via shared portfolio link (e.g., `https://ccsharvin.vercel.app/portfolio/sharvin`).
2. Server Component statically delivers clean, un-gated candidate portfolio.
3. Recruiter reviews:
   - Verified case studies with latency metrics and throughput comparisons.
   - Competency radar showing proof tier tags (`VERIFIED`, `PROJECT`, `ASSESSED`).
   - GitHub repositories with live code links.
4. Recruiter clicks "Share Profile" or copies email/LinkedIn directly.

---

## 4. Flow Friction Points & Disconnects

1. **Disconnected Entity Creation**:
   - Creating a resource in `/resources` or a certification in `/certifications` does not offer a prompt or link to tie it directly to a project in `/projects` or a skill in `/skills`.
2. **Missing In-App Navigation Breadcrumbs**:
   - Complex sub-pages (e.g., `/algorithm-sandbox`, `/salary-insights`) lack back navigation or breadcrumbs to return directly to the originating Next Best Action recommendation.
3. **One-Way ATS Injection**:
   - The "Inject Project Proof" action in `/ats-checker` modifies in-memory state during the session, but does not persist the updated resume version to `/resume-builder` without manual copy-pasting.
