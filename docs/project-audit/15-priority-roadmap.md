# 15 — Priority Implementation Roadmap: Catalyst OS

A structured, prioritized action plan classifying all recommended improvements into P0 (Critical), P1 (High Priority), P2 (Important), and P3 (Nice to Have).

---

## 1. Roadmap Overview Matrix

| Priority | Initiative | Severity | Impact | Estimated Effort |
| :--- | :--- | :---: | :---: | :---: |
| **P0** | Fix `/api/projects` `ReferenceError` Runtime Bug | **Critical** | Production API fix | ~15 mins |
| **P0** | Fix Serverless Logger Filesystem Incompatibility in `security.js` | **Critical** | Production Logging | ~20 mins |
| **P1** | Remove Hardcoded Supabase Credentials & Isolate Env Vars | **High** | Security & Config | ~20 mins |
| **P1** | Add Global Skip-to-Main-Content Navigation (WCAG 2.1 AA) | **High** | Accessibility | ~15 mins |
| **P1** | Unify Sub-App State Mutations into Global `CareerContext` | **High** | State Sync & UX | ~2 hours |
| **P2** | Add Skeleton & Shimmer Loading States across Sub-Apps | **Medium** | Perceived Performance | ~1.5 hours |
| **P2** | Extract Core Shared UI Primitives (`<Button>`, `<Badge>`, `<Card>`) | **Medium** | Code Maintainability | ~2.5 hours |
| **P2** | Dark Mode Muted Contrast Fix for Micro-Labels | **Medium** | Accessibility | ~30 mins |
| **P2** | Add Vitest Suite for Core Readiness & Math Algorithms | **Medium** | Regression Safety | ~2 hours |
| **P3** | Incremental TypeScript Migration for Domain Types | **Low** | Developer Experience | ~3 hours |
| **P3** | Declarative Supabase Schema Migrations (`supabase/migrations/`) | **Low** | Reproducibility | ~2 hours |
| **P3** | Mobile Table Ergonomics in `/coding-tracker` | **Low** | Mobile Polish | ~1 hour |

---

## 2. Detailed Initiative Specifications

### P0 — Critical (Immediate Fixes Required)

#### 1. Fix `/api/projects` ReferenceError Bug
- **Issue**: `GET /api/projects` throws `ReferenceError: projectsWithMilestones is not defined` and returns HTTP 500.
- **Evidence**: `src/app/api/projects/route.js:L82`. Live site returns 500 error.
- **Affected Files**: `src/app/api/projects/route.js`
- **User Impact**: Live project database queries fail, falling back to mock data.
- **Technical Impact**: Unhandled server exception in production API route.
- **Severity**: **P0 (Critical)**
- **Recommended Solution**: Map `projects` data with their corresponding `milestones` to properly declare and initialize `projectsWithMilestones` before line 82.
- **Dependencies**: None.
- **Estimated Complexity**: **Very Low** (10–15 mins).

#### 2. Serverless Logger Filesystem Compatibility
- **Issue**: `logSecurityEvent` in `security.js` calls `fs.appendFileSync` on a read-only Vercel filesystem.
- **Evidence**: `src/lib/security.js:L37`.
- **Affected Files**: `src/lib/security.js`
- **User Impact**: Silent failure of security event logging; inability to monitor threat logs on Vercel.
- **Technical Impact**: Dropped telemetry in cloud serverless environment.
- **Severity**: **P0 (Critical)**
- **Recommended Solution**: Replace `fs.appendFileSync` with formatted `console.warn` / `console.error` structured JSON logging for automated ingestion by Vercel Log Drains.
- **Dependencies**: None.
- **Estimated Complexity**: **Very Low** (15–20 mins).

---

### P1 — High Priority (Security, Accessibility & Core UX)

#### 3. Environment Variable Security & Credential Hygiene
- **Issue**: Hardcoded fallback Supabase Project URL and JWT Anon key in source code.
- **Evidence**: `src/lib/supabase.js:L12-13`.
- **Affected Files**: `src/lib/supabase.js`, `.env.example`
- **User Impact**: Project credentials visible in repository.
- **Technical Impact**: Security risk and configuration ambiguity.
- **Severity**: **P1 (High)**
- **Recommended Solution**: Enforce `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` without committing plaintext fallback JWTs.
- **Dependencies**: Vercel environment variable configuration.
- **Estimated Complexity**: **Low** (20 mins).

#### 4. Global Skip-to-Main-Content Navigation
- **Issue**: Missing skip navigation link forces keyboard and screen reader users to tab through 18 sidebar items on every page change.
- **Evidence**: `src/app/layout.js:L25`.
- **Affected Files**: `src/app/layout.js`, `src/app/globals.css`
- **User Impact**: Inefficient navigation for keyboard-only and assistive technology users.
- **Technical Impact**: Non-compliance with WCAG 2.1 AA (Success Criterion 2.4.1).
- **Severity**: **P1 (High)**
- **Recommended Solution**: Add `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>` in `layout.js`.
- **Dependencies**: None.
- **Estimated Complexity**: **Very Low** (15 mins).

#### 5. Unified State Synchronization Layer
- **Issue**: Sub-apps (`/certifications`, `/coding-tracker`, `/resources`) do not sync mutations back to `CareerContext` readiness formulas.
- **Evidence**: `src/app/certifications/page.js`, `src/app/coding-tracker/page.js`, `src/context/CareerContext.js`.
- **Affected Files**: `src/context/CareerContext.js`, `src/app/certifications/page.js`, `src/app/coding-tracker/page.js`
- **User Impact**: Completing learning tasks does not immediately increase the readiness gauge in the header.
- **Technical Impact**: Fragmented client state.
- **Severity**: **P1 (High)**
- **Recommended Solution**: Expose mutation dispatchers in `CareerContext` (`addCertification`, `completeCodingProblem`, `addResource`) and wire them to sub-app save actions.
- **Dependencies**: `CareerContext.js`.
- **Estimated Complexity**: **Medium** (2 hours).

---

### P2 — Important (Architecture & Design Polish)

#### 6. Skeleton & Shimmer Loading States
- **Issue**: UI abruptly swaps from empty to rendered state when client-side data finishes fetching.
- **Affected Files**: `src/app/job-tracker/page.js`, `src/app/projects/page.js`, `src/app/skills/page.js`
- **Severity**: **P2 (Important)**
- **Recommended Solution**: Implement animated CSS shimmer placeholders during data loading.
- **Estimated Complexity**: **Medium** (1.5 hours).

#### 7. Shared UI Primitive Library (`src/components/ui/`)
- **Issue**: Proliferation of duplicated inline styles across pages.
- **Affected Files**: `src/components/ui/`, `src/app/page.js`, `src/app/job-tracker/page.js`
- **Severity**: **P2 (Important)**
- **Recommended Solution**: Extract `<Button>`, `<Card>`, `<Badge>`, and `<Modal>` primitives.
- **Estimated Complexity**: **Medium** (2.5 hours).

#### 8. Automated Mathematical Test Suite (Vitest)
- **Issue**: 0% automated test coverage for critical career scoring and ranking formulas.
- **Affected Files**: `src/lib/careerGraph.js`
- **Severity**: **P2 (Important)**
- **Recommended Solution**: Add Vitest unit tests verifying `calculateCareerReadiness` and `generateNextBestAction`.
- **Estimated Complexity**: **Medium** (2 hours).

---

### P3 — Nice to Have (Future Enhancements)

#### 9. Incremental TypeScript Types
- **Issue**: Lack of compile-time type validation across domain models.
- **Severity**: **P3 (Nice to Have)**
- **Recommended Solution**: Add `types/career.ts` with interfaces for `CareerTrack`, `Skill`, `Project`, and `Job`.
- **Estimated Complexity**: **Medium** (3 hours).

#### 10. Declarative Supabase Schema Migrations
- **Issue**: No checked-in SQL migrations for the 12 production tables.
- **Severity**: **P3 (Nice to Have)**
- **Recommended Solution**: Export and commit `supabase/migrations/20260831_init.sql`.
- **Estimated Complexity**: **Low** (2 hours).
