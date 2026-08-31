# 14. Prioritized Next Opportunities for Connected Intelligence

## 1. Prioritized Opportunity Matrix

Based on the Phase 5C.4 integration audit, the following opportunities are ranked by impact on product coherence and user value:

```text
[PRIORITIZED ROADMAP TIERS]
  ├─ P0: Product Coherence Blockers       (0 Blockers identified)
  ├─ P1: High-Value Intelligence Links    (Mock Interview Context, Pitch Studio Auto-fill)
  ├─ P2: Experience Enhancements          (Return breadcrumbs, Salary Insights Offer Link)
  └─ P3: Advanced / Experimental Systems  (GitHub live commit auto-verification, eBPF telemetry)
```

---

## 2. Detailed Opportunity Breakdown

### P0 — Product Coherence Blockers
* **Status**: **ZERO P0 BLOCKERS IDENTIFIED**. All core flows operate smoothly without broken routes or state dead-ends.

---

### P1 — High-Value Intelligence Connections
1. **Active Interview ➔ Mock Interview Auto-Calibration**:
   * *Opportunity*: When an active interview is present (e.g. Anthropic), automatically pre-configure the Mock Interview simulator with Anthropic's technical focus areas and system design rubrics.
2. **Job Pipeline ➔ Pitch Studio / Cover Letter Auto-Fill**:
   * *Opportunity*: Allow 1-click generation of tailored pitches and cover letters directly from a Job Tracker application card, importing company name, role requirements, and verified candidate evidence.
3. **ATS Injected Evidence ➔ Resume Canvas Auto-Sync**:
   * *Opportunity*: When ATS keyword evidence is injected in `/ats-checker`, automatically format and append a verified bullet point into the candidate's active resume draft in `/resume-builder`.

---

### P2 — Experience Enhancements
1. **Return Navigation Breadcrumbs**:
   * *Opportunity*: Add `"← Back to Career Analytics"` breadcrumb to the Project Generator Contextual Banner.
2. **Job Pipeline Offer Stage ➔ Salary & Equity Insights**:
   * *Opportunity*: When a job moves to `offer` stage in Job Tracker, offer a 1-click bridge to `/salary-insights` pre-populated with the company's compensation range and equity percentiles.
3. **Research Library ➔ Question Bank Deep Links**:
   * *Opportunity*: On technical interview questions with empirical citations, add a direct link to the corresponding paper in `/resources`.

---

### P3 — Advanced / Experimental Features
1. **Live GitHub Commit Verification**:
   * *Opportunity*: Connect the GitHub evidence tab to automatically verify commit frequency and repository activity against portfolio case study claims.
2. **Triton Latency Sandbox ➔ Portfolio Artifact Export**:
   * *Opportunity*: Allow candidates to export real Triton GPU kernel execution benchmarks from the latency sandbox directly into their portfolio case studies.
