# 04. Job Tracker Integration Specification

## 1. Contextual Actions in Job Tracker

In [`src/app/job-tracker/page.js`](file:///E:/career-catalyst/src/app/job-tracker/page.js), target application cards in active interview stages feature two paired Connected Intelligence affordances in the preview drawer:

```text
┌────────────────────────────────────────────────────────┐
│ ⚡ ACTIVE TECHNICAL INTERVIEW STAGE                     │
│ Prepare system design, architecture trade-offs, or run │
│ an AI simulation for Anthropic.                        │
│                                                        │
│ [ 🎯 QUESTION BANK → ]    [ 🎙️ SIMULATE ROUND → ]      │
└────────────────────────────────────────────────────────┘
```

---

## 2. Interaction Contract

* **Question Bank CTA**: Deep-links to `/interview-prep?company=Anthropic&role=ML%20Systems` (Connection C).
* **Simulate Round CTA**: Deep-links to `/mock-interview?company=Anthropic&role=ML%20Systems` (Connection D).
* **State Preservation**: Opening the drawer does not lose filter criteria or Kanban column scroll position.
