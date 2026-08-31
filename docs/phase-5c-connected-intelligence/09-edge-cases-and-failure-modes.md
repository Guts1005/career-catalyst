# 09. Edge Cases, Failure Modes & Defensive Invariants

## 1. Failure Modes & Defensive Strategies

This document defines defensive guardrails for all 3 connected intelligence pathways to guarantee zero runtime crashes, zero stale renders, and full resilience.

---

## 2. Exhaustive Edge Case Matrix

| Scenario / Edge Case | Trigger Condition | System Risk | Defensive Resolution / Invariant |
| :--- | :--- | :--- | :--- |
| **1. Zero Score Delta** | Action completes but readiness score remains unchanged (e.g. minor note edit). | Pointless toast or confusing `+0%` notification. | Guard: Suppress feedback toast if `overallDelta === 0 && subscoreDelta === 0` unless evidence tier upgraded. |
| **2. Unmatched Skill Gap** | Gap detected for a skill with no matching blueprint in `GAP_BLUEPRINT_REGISTRY`. | Broken link or empty blueprint page. | Fallback: Navigate to `/project-generator` with generic domain filter (`all`) and default blueprint search. |
| **3. Unrecognized Company** | Candidate adds application for a startup (e.g. "Acme AI") with no specific questions. | Empty filter in `/interview-prep`. | Fallback: Query defaults to general role questions (e.g. "ML System Design") instead of strict company filter. |
| **4. Rapid Double-Clicking** | User clicks "Complete Milestone" 5 times in 500ms. | Flooded event bus and overlapping toasts. | Throttle/Debounce: Event dispatcher queues state updates and coalesces them into a single summary delta. |
| **5. Persona Switch Mid-Action** | User triggers an action and immediately switches persona to Elena. | Cross-persona state pollution. | Invariant: Persona switch flushes event queue and instantiates pristine persona baseline. |
| **6. Navigation Away During Event** | User earns cert and immediately clicks back to Homepage before toast timer completes. | Memory leaks or unmounted component errors. | Invariant: Toasts are mounted at top-level layout (`ToastProvider`), surviving route transitions safely. |
| **7. Supabase Database Unreachable** | Remote database times out (>2.5s) or fails during mutation. | App freezes or throws 500 error. | Fallback: In-memory state mutation completes immediately; graceful fallback toast notifies user. |

---

## 3. Graceful Degradation Invariants

```text
[OFFLINE / DEMO RESILIENCE GUARANTEE]
  If Supabase is offline:
    1. Read operations fail fast (<2.5s) and serve default benchmark data.
    2. Write operations update CareerContext in-memory + localStorage.
    3. Mathematical readiness calculations execute 100% locally.
    4. Domain events fire and update UI with zero network dependencies.
```
