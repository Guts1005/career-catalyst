# 07. Global Event Delivery & Centralized Architecture

## 1. Centralized Event Architecture

To avoid duplicating toast dispatchers across individual pages, all state-delta evaluations and feedback events are centralized within [`src/context/CareerContext.js`](file:///E:/career-catalyst/src/context/CareerContext.js):

```mermaid
graph TD
    P1[src/app/certifications/page.js] -->|calls syncCertification| CC[CareerContext.js]
    P2[src/app/coding-tracker/page.js] -->|calls syncSolvedProblem| CC
    P3[src/app/ats-checker/page.js] -->|calls injectATSProof| CC
    P4[src/app/projects/page.js] -->|calls completeProjectMilestone| CC
    
    CC -->|1. evaluateStateDelta| DE[readinessDeltaEngine.ts]
    DE -->|2. ReadinessStateDelta| CC
    CC -->|3. showReadinessFeedback| TC[ToastContainer (Root Layout)]
```

---

## 2. Benefits of Centralized Delivery

1. **Zero Boilerplate in Sub-Apps**: Individual pages simply call domain methods (e.g. `syncCertification(data)`).
2. **Consistent Calculations**: Prevents individual pages from computing inaccurate or out-of-sync readiness scores.
3. **Global Persistence**: Feedback remains visible and interactive even if the candidate navigates to another page immediately after completing an action.
