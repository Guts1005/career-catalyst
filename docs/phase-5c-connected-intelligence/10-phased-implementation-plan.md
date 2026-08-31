# 10. Phased Implementation Plan (5C.1, 5C.2, 5C.3)

## 1. Phased Roadmap Overview

Connected intelligence is broken into 3 decoupled, independently testable implementation milestones:

```text
Phase 5C.1: Gap ➔ Actionable Blueprint Connection
     ↓
Phase 5C.2: Cause ➔ Effect Readiness Feedback Loop
     ↓
Phase 5C.3: Job Pipeline ➔ Contextual Interview Preparation
```

---

## 2. Phase 5C.1 — Gap ➔ Blueprint Connection

* **Objective**: Connect identified skill deficits in Analytics & Skills directly to actionable project blueprints in Project Generator.
* **Files Likely Affected**:
  * [`src/lib/careerGraph.ts`](file:///E:/career-catalyst/src/lib/careerGraph.ts): Add `GAP_BLUEPRINT_REGISTRY` mapping.
  * [`src/app/analytics/page.js`](file:///E:/career-catalyst/src/app/analytics/page.js): Add 1-click `[BUILD BLUEPRINT →]` buttons next to gap rows.
  * [`src/app/skills/page.js`](file:///E:/career-catalyst/src/app/skills/page.js): Add blueprint recommendation links to low-evidence skills.
  * [`src/app/project-generator/page.js`](file:///E:/career-catalyst/src/app/project-generator/page.js): Handle `?skillGap=` query parameter and highlight recommended blueprint.
* **Acceptance Criteria**:
  1. Clicking `[BUILD BLUEPRINT]` on a gap in `/analytics` navigates to `/project-generator` with the matching blueprint highlighted.
  2. Clicking `IMPORT TO PORTFOLIO` adds the project to `/projects` with milestone tasks pre-filled.
  3. Completing milestones upgrades skill evidence level and closes the gap.

---

## 3. Phase 5C.2 — Cause ➔ Effect Readiness Feedback

* **Objective**: Provide explicit, mathematically authentic notifications explaining score deltas when credentials, problems, or milestones are completed.
* **Files Likely Affected**:
  * [`src/context/CareerContext.js`](file:///E:/career-catalyst/src/context/CareerContext.js): Add `evaluateStateDelta` calculation to action dispatchers (`syncCertification`, `syncSolvedProblem`, `injectATSProof`, `completeMilestone`).
  * [`src/components/Toast.js`](file:///E:/career-catalyst/src/components/Toast.js): Support structured career intelligence toast formatting.
* **Acceptance Criteria**:
  1. Earning a credential displays: `✨ Credential Verified: +5% added to Pipeline Velocity (63% ➔ 64%)`.
  2. Solving a problem displays: `⚡ Competency Mastered: PyTorch & CUDA upgraded to [VERIFIED] tier`.
  3. No toast displays if score delta is 0 and no tier change occurs.

---

## 4. Phase 5C.3 — Pipeline ➔ Interview Context

* **Objective**: Connect job application stage transitions on the Kanban board directly to company-specific system design flashcards.
* **Files Likely Affected**:
  * [`src/context/CareerContext.js`](file:///E:/career-catalyst/src/context/CareerContext.js): Add `activeInterviewContext` tracking.
  * [`src/app/job-tracker/page.js`](file:///E:/career-catalyst/src/app/job-tracker/page.js): Render contextual interview preparation badge on `interview` and `final` cards.
  * [`src/app/interview-prep/page.js`](file:///E:/career-catalyst/src/app/interview-prep/page.js): Ensure company filtering highlights matching questions cleanly.
* **Acceptance Criteria**:
  1. Moving a job card to `interview` displays: `🎯 4 Anthropic Flashcards Ready [OPEN FLASHCARDS →]`.
  2. Clicking the button opens `/interview-prep?company=Anthropic` without breaking user flow.
  3. Dashboard Next Best Action card updates to prioritize active interview prep.
