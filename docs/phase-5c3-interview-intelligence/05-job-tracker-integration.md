# 05. Job Tracker Kanban Integration Specification

## 1. Contextual Card Affordances

In the Job Tracker Kanban board ([`src/app/job-tracker/page.js`](file:///E:/career-catalyst/src/app/job-tracker/page.js)), application cards located in active interview stages (`interview`, `final`, `oa`) feature an inline contextual preparation CTA:

```text
┌────────────────────────────────────────────────────────┐
│ Anthropic                                   95% MATCH  │
│ ML Systems Engineer                                    │
│ San Francisco, CA • $210,000 - $270,000                │
│ [✓ PyTorch] [✓ Triton] [✓ CUDA]                        │
│ ────────────────────────────────────────────────────── │
│ [ 🎯 PREPARE FOR ANTHROPIC                          → ]│
└────────────────────────────────────────────────────────┘
```

---

## 2. Interaction & Isolation Contract

1. **Direct Deep Link**: Clicking `[🎯 PREPARE FOR ANTHROPIC →]` navigates directly to `/interview-prep?company=Anthropic&role=ML%20Systems%20Engineer&stage=interview`.
2. **Event Propagation Isolation**: `onClick={(e) => e.stopPropagation()}` ensures that clicking the preparation CTA triggers navigation without opening the underlying preview drawer.
3. **Accessibility**: Button has descriptive `aria-label="Prepare technical questions for Anthropic ML Systems Engineer interview"` and high-contrast styling.
4. **Selective Presence**: Cards in `wishlist`, `applied`, `offer`, or `rejected` omit the CTA to keep the board clutter-free.
