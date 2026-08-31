# 16 — Phase 2 Implementation Plan: Catalyst OS

A rigorous, phased action plan for implementing improvements across Catalyst OS based on the Phase 1 audit and approved user decisions.

---

## 1. Approved Architectural Decisions

1. **Authentication & Multi-Tenancy**:
   - Maintain **Public Demonstration Mode** for Phase 2.
   - Do not implement Supabase OAuth or private accounts yet.
   - Ensure all data structures and API routes are cleanly prepared for future `user_id` tagging and RLS policies.
   - Document the complete multi-tenant migration architecture in `docs/architecture/future-auth-and-multi-tenancy.md`.
2. **TypeScript Migration Strategy**:
   - **Incremental TypeScript adoption**: Migrate critical domain logic and infrastructure files (`careerGraph.ts`, `security.ts`, `supabase.ts`, `types/career.ts`).
   - Keep presentation and UI components in JavaScript/JSX unless there is a distinct typing advantage.
3. **UI Styling Strategy**:
   - Maintain **CSS Modules + Semantic Design Tokens** (no Tailwind CSS).
   - Formalize design tokens in `globals.css` and extract clean, reusable primitives (`Button`, `Card`, `Badge`, `Modal`, `Skeleton`, `EmptyState`) in `src/components/ui/`.

---

## 2. Phased Implementation Milestones

```
┌────────────────────────────────────────────────────────────────────────────┐
│                       PHASE 2 IMPLEMENTATION PIPELINE                      │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  [MILESTONE 1] P0 Critical Bug Fixes & Serverless Resilience               │
│  ├─ Fix ReferenceError in /api/projects                                    │
│  ├─ Fix Serverless Logger in security.js (Vercel Log Drain support)        │
│  └─ Clean up credentials & node:dns import in supabase.js                  │
│                                                                            │
│  [MILESTONE 2] Core State Synchronization & Closed-Loop Workflows          │
│  ├─ Unify sub-app mutations into CareerContext (skills, certs, resources)  │
│  ├─ Connect learning actions directly to live Readiness Score updates      │
│  └─ Complete bidirectional ATS-to-Resume injection                         │
│                                                                            │
│  [MILESTONE 3] Accessibility & Navigation Infrastructure                   │
│  ├─ Add Skip-to-Main-Content navigation link (WCAG 2.1 AA)                 │
│  ├─ Dark mode color contrast remediation on micro-labels                   │
│  ├─ Add breadcrumbs / back navigation on deep sub-pages                    │
│  └─ Add ARIA sliders and modal focus trapping                              │
│                                                                            │
│  [MILESTONE 4] Design System Consolidation & UI Primitives                 │
│  ├─ Formalize semantic design tokens in globals.css                        │
│  ├─ Build reusable primitives in src/components/ui/ (Button, Badge, etc.)  │
│  └─ Refactor highest-friction inline styles in core dashboard views        │
│                                                                            │
│  [MILESTONE 5] Incremental TypeScript Migration                            │
│  ├─ Create domain type definitions in src/types/career.ts                  │
│  ├─ Migrate careerGraph.js ➔ careerGraph.ts                               │
│  ├─ Migrate security.js ➔ security.ts                                     │
│  ├─ Migrate supabase.js ➔ supabase.ts                                     │
│  └─ Verify zero build regressions via Turbopack build                      │
│                                                                            │
│  [MILESTONE 6] Performance Optimization & Caching                          │
│  ├─ Add response caching to static endpoints (/api/resources, etc.)        │
│  └─ Optimize client-side hydration in CareerProvider                       │
│                                                                            │
│  [MILESTONE 7] Future Auth & Multi-Tenancy Architecture Spec               │
│  └─ Author comprehensive migration document for Supabase Auth & RLS        │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Milestone Specifications & Verification Criteria

### Milestone 1: P0 Critical Bug Fixes & Serverless Resilience
- **Objective**: Fix production runtime crash on `/api/projects` and eliminate serverless filesystem errors in `security.js`.
- **Audit Findings Addressed**: `ISSUE-01`, `ISSUE-02`, `ISSUE-03`, `ISSUE-04`.
- **Affected Files**:
  - `src/app/api/projects/route.js`
  - `src/lib/security.js`
  - `src/lib/supabase.js`
- **Risks**: Modifying API response shapes could break frontend consumers if milestone array assembly changes.
- **Verification**: Run local and remote HTTP probes (`GET /api/projects`, `POST /api/jobs` validation failure) to verify HTTP 200 responses and clean JSON output.

---

### Milestone 2: Core State Synchronization & Closed-Loop Workflows
- **Objective**: Ensure that mutations in standalone sub-apps (`/certifications`, `/coding-tracker`, `/resources`) immediately reflect in `CareerContext` readiness calculations.
- **Audit Findings Addressed**: `ISSUE-06`, user flow disconnects.
- **Affected Files**:
  - `src/context/CareerContext.js`
  - `src/app/certifications/page.js`
  - `src/app/coding-tracker/page.js`
  - `src/app/resources/page.js`
  - `src/app/ats-checker/page.js`
- **Risks**: Context re-render frequency could increase if mutation callbacks are not memoized.
- **Verification**: Add a certification or solved problem in the UI and confirm the Readiness Score in the sidebar updates dynamically.

---

### Milestone 3: Accessibility & Navigation Infrastructure
- **Objective**: Comply with WCAG 2.1 AA standards for keyboard navigation, dark mode contrast, and assistive tech.
- **Audit Findings Addressed**: `ISSUE-05`, `ISSUE-07`.
- **Affected Files**:
  - `src/app/layout.js`
  - `src/app/globals.css`
  - `src/components/BenchmarkLatencyVisualizer.js`
  - `src/components/CompensationEquityModeler.js`
  - `src/components/OnboardingModal.js`
- **Risks**: Modifying `--text-muted` in dark mode could affect visual hierarchy if contrast is too high.
- **Verification**: Tab navigation test (Skip Link appears on first Tab press), contrast ratio verification via DevTools.

---

### Milestone 4: Design System Consolidation & UI Primitives
- **Objective**: Reduce inline style fragmentation by extracting modular, accessible UI primitives.
- **Audit Findings Addressed**: `ISSUE-09`, design system audit.
- **Affected Files**:
  - `src/app/globals.css`
  - `src/components/ui/Button.js` + `Button.module.css`
  - `src/components/ui/Badge.js` + `Badge.module.css`
  - `src/components/ui/Card.js` + `Card.module.css`
  - `src/components/ui/Modal.js` + `Modal.module.css`
  - `src/components/ui/Skeleton.js` + `Skeleton.module.css`
  - `src/components/ui/EmptyState.js` + `EmptyState.module.css`
- **Risks**: Visual regressions if extracted primitives do not match existing padding and flexbox layouts.
- **Verification**: Visual inspection across light and dark modes, mobile responsive check.

---

### Milestone 5: Incremental TypeScript Migration
- **Objective**: Type critical career calculations, domain models, and security logic with TypeScript.
- **Audit Findings Addressed**: `ISSUE-01` prevention, code quality audit.
- **Affected Files**:
  - `tsconfig.json` (Initialize Next.js TS config)
  - `src/types/career.ts` (Domain models)
  - `src/lib/careerGraph.ts` (Converted from `.js`)
  - `src/lib/security.ts` (Converted from `.js`)
  - `src/lib/supabase.ts` (Converted from `.js`)
- **Risks**: Type mismatches during Next.js Turbopack build.
- **Verification**: Execute `npm run build` to confirm zero TypeScript compilation errors.

---

### Milestone 6: Performance Optimization & Caching
- **Objective**: Optimize data delivery and eliminate unnecessary database queries.
- **Audit Findings Addressed**: `ISSUE-10`, performance audit.
- **Affected Files**:
  - `src/app/api/salary-insights/route.js`
  - `src/app/api/resources/route.js`
  - `src/context/CareerContext.js`
- **Risks**: Stale cached responses if cache headers are too aggressive.
- **Verification**: Measure response latency and verify `Cache-Control` headers.

---

### Milestone 7: Future Auth & Multi-Tenancy Architecture Document
- **Objective**: Document exact specifications for a future transition to Supabase Auth, GitHub OAuth, and RLS.
- **Deliverable**: `docs/architecture/future-auth-and-multi-tenancy.md`.
