# 06. State Ownership & Architecture Boundary Audit

## 1. Single Source of Truth Hierarchy

```text
[LEVEL 1: CLIENT CONTEXT (CareerContext.js)]
  ├── activePersonaId, targetRole, userProfile
  ├── skills, projects, jobs, certifications, resources
  ├── injectedBullets (Connection F staging queue)
  ├── solvedProblems & assessments (Connection D)
  └── readiness (computed dynamically via calculateCareerReadiness)

[LEVEL 2: ROUTE URL QUERY SEARCH PARAMS]
  ├── ?blueprintId=... (Connection A)
  ├── ?company=... &role=... &stage=... (Connections C, D, E, H)
  ├── ?paper=... &arxiv=... (Connection G)
  └── ?base=... &equity=... &bonus=... (Connection H)

[LEVEL 3: BACKEND API & SUPABASE PERSISTENCE]
  ├── /api/skills, /api/projects, /api/jobs
  ├── /api/resume, /api/cover-letter, /api/salary-insights
  ├── /api/resources, /api/mock-interview
  └── /api/activity_log
```

---

## 2. Invariants & Isolation Contract

1. **URL Parameters as Route Modifiers**: URL query parameters hydrate initial view state without overriding uncommitted candidate modifications.
2. **Context Subscriptions**: Pages subscribe directly to `CareerContext` without intermediate prop drilling.
3. **No Hidden State**: Staged evidence bullets (`injectedBullets`) are visible to both the candidate and the readiness evaluation engine.
