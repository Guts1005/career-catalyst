# 09. Multiple Action Handling & Sequencing Specification

## 1. Multiple Action Scenarios & Behavior Matrix

| Action Scenario | Underlying React State Behavior | Notification Stack Behavior | Result |
| :--- | :--- | :--- | :--- |
| **1. Single Action** | Synchronous delta calculated; toast queued. | 1 structured toast displayed for `6500ms`. | Clean presentation. |
| **2. Rapid Sequential Actions** | State updates via standard functional setters (`setCertifications(prev => ...)`). | Toast container limits queue to `[...prev.slice(-1), nextToast]`. | Stale toast cleanly replaced; no screen clipping. |
| **3. Action with Zero Delta** | `overallDelta === 0 && subscoreDelta === 0`. | Suppresses structured feedback toast; shows standard small notice. | Zero misleading celebrations. |
| **4. Action changing Next Best Action** | `nextBestActionChanged === true`. | Renders Next Action footer with deep-link button. | Instant user guidance. |
| **5. Action with Error in Network** | API request fails in caller component. | Domain mutation callback aborted; no state change or delta event fired. | System state remains pristine. |

---

## 2. Race Condition Prevention

* **Pure State Ingestion**: `evaluateStateDelta` receives snapshot arguments explicitly rather than reading asynchronous references.
* **Deterministic IDs**: Every event receives a unique timestamped key (`delta_${Date.now()}_${random}`), ensuring clean React reconciliation without duplicate key warnings.
