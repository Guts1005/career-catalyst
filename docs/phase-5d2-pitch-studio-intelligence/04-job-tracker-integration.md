# 04. Job Tracker Integration Specification for Phase 5D.2

## 1. Job Tracker Drawer Affordances

In [`src/app/job-tracker/page.js`](file:///E:/career-catalyst/src/app/job-tracker/page.js), every application card preview drawer features a direct bridge to the Pitch Studio:

```text
┌────────────────────────────────────────────────────────┐
│ ⚡ TARGET APPLICATION ACTION                            │
│ Generate a tailored STAR cover letter and recruiter    │
│ InMail outreach with your verified project evidence.   │
│                                                        │
│ [ 📝 GENERATE TAILORED PITCH → ]                       │
└────────────────────────────────────────────────────────┘
```

---

## 2. Interaction Contract

* **Link Target**: Navigates to `/cover-letter?company={company}&role={role}&skills={skills}`.
* **Auto-Hydration**: The Pitch Studio immediately pre-populates company, role, requirements, and links the candidate's active portfolio projects.
* **State Preservation**: Returning from the Pitch Studio preserves the candidate's active filters and Kanban column arrangement.
