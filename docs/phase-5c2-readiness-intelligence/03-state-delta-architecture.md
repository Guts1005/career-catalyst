# 03. Real State Delta Engine Architecture

## 1. Mathematical Architecture & Delta Derivation

The delta engine is implemented as a pure, synchronous module in [`src/lib/readinessDeltaEngine.ts`](file:///E:/career-catalyst/src/lib/readinessDeltaEngine.ts).

$$\Delta_{\text{Overall}} = \text{Readiness}_{\text{Next}}.\text{overallScore} - \text{Readiness}_{\text{Prev}}.\text{overallScore}$$

$$\Delta_{\text{Subscore}} = \text{Dimension}_{\text{Next}}.\text{score} - \text{Dimension}_{\text{Prev}}.\text{score}$$

```mermaid
sequenceDiagram
    autonumber
    participant Action as Domain Action Callback
    participant Prev as Previous State Snapshot
    participant Next as Next State Snapshot
    participant Engine as readinessDeltaEngine.ts
    participant Toast as Toast.js (Global Renderer)

    Action->>Prev: Capture Current State Parameters
    Action->>Next: Compute Mutated State Array
    Action->>Engine: evaluateStateDelta(Prev, Next, ActionMeta)
    Engine->>Engine: Calculate prev & next readiness scores
    Engine->>Engine: Detect affected dimension & score deltas
    Engine->>Engine: Compare prev & next NextBestAction
    Engine-->>Action: Returns ReadinessStateDelta struct
    alt isSignificant == true
        Action->>Toast: showReadinessFeedback(deltaResult)
        Toast-->>Action: Renders Structured Intelligence Toast
    else
        Action->>Toast: showToast(simpleNotice)
    end
```

---

## 2. Invariants Enforced

1. **Zero Hardcoded Numbers**: All score changes ($+1\%$, $+5\%$, etc.) are calculated from real state evaluation.
2. **Synchronous Execution**: Runs entirely in client memory in $< 0.05\text{ms}$.
3. **Zero Network Calls**: No API or database roundtrips required to compute state deltas.
4. **Idempotence**: Evaluating identical states always produces $\Delta = 0$.
