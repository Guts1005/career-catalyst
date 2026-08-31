# 11. Risk & Regression Analysis

## 1. Connection Complexity & Risk Classification

```text
+---------------------------------------------------------------------------------------+
| HIGHEST-VALUE: Connection A (Gap ➔ Actionable Blueprint)                              |
| Direct engineering path turning abstract deficits into portfolio proof.              |
+---------------------------------------------------------------------------------------+
| HIGHEST-RISK: Connection B (Cause ➔ Effect Readiness State Comparison)                |
| Potential for cascading re-renders or feedback loops if dispatchers are unmemoized.   |
+---------------------------------------------------------------------------------------+
| SIMPLEST: Connection C (Job Pipeline ➔ Contextual Interview Prep)                     |
| Clean declarative state mapping using existing searchParams and Kanban stage triggers.|
+---------------------------------------------------------------------------------------+
```

---

## 2. Risk Mitigation & Defensive Architecture

| Proposed Connection | Primary Risk | Root Cause | Architectural Mitigation |
| :--- | :--- | :--- | :--- |
| **Connection A (Gap ➔ Blueprint)** | Inconsistent blueprint naming or missing template. | Desynchronization between `careerGraph.ts` and `PROJECT_BLUEPRINTS`. | Centralize `GAP_BLUEPRINT_REGISTRY` with fallback to domain root if specific template ID is absent. |
| **Connection B (Readiness Feedback)** | Cascading re-renders or infinite loops in React Context. | Calling state mutation inside calculation effect. | Ensure delta calculation is computed purely synchronously inside the user-triggered action handler *before* setting state. |
| **Connection C (Pipeline ➔ Interview)**| Over-filtering in Interview Prep resulting in zero questions. | Strict string equality failing on company names (e.g. "Anthropic" vs "Anthropic PBC"). | Use case-insensitive substring matching (`includes`) and fall back to category search. |

---

## 3. Regression Safeguards

1. **Zero External State Dependencies**: By avoiding Redux/Zustand, bundle size remains unchanged and React 19 concurrent features remain uncompromised.
2. **Strict Memoization**: All action dispatchers in `CareerContext.js` will be wrapped in `useCallback` to prevent downstream component churn.
3. **Public Demo Mode Invariant**: All connections must work 100% in-memory with preloaded persona datasets without requiring live Supabase credentials.
