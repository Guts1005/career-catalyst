# 10. Accessibility (a11y) Verification

## 1. WCAG 2.1 AA Compliance Verification

| Accessibility Criteria | Target Feature | Verification Detail | Status |
| :--- | :--- | :--- | :---: |
| **1.3.1 Info & Relationships** (Level A) | Contextual Banner & Pipeline Switcher | Semantic `<div role="region" aria-label="...">` with clear landmarks. | **PASS** |
| **2.4.4 Link Purpose in Context** (Level A) | Kanban & Switcher CTAs | Descriptive aria-labels (e.g. `Prepare technical questions for Anthropic ML Systems Engineer interview`). | **PASS** |
| **2.4.7 Focus Visible** (Level AA) | Question Cards & Switcher Buttons | High-contrast `2px solid var(--purple)` focus indicators on `:focus-visible`. | **PASS** |
| **1.4.3 Contrast (Minimum)** (Level AA) | Badges & Text Elements | Purple badge (5.6:1), header text (15.2:1), category tags (6.8:1). | **PASS** |
| **2.1.1 Keyboard Navigation** (Level A) | Question Accordion & Search | `/` focuses search; `Enter`/`Space` expands questions and triggers answer disclosures. | **PASS** |

---

## 2. Screen Reader Accessibility Tree

```text
- region "Active Interview Pipeline Context"
  - text: "⚡ ACTIVE INTERVIEW PIPELINES:"
  - button: "Calibrate questions for Anthropic interview"
  - button: "Calibrate questions for NVIDIA interview"
- region "Active interview preparation context for Anthropic"
  - text: "🎯 CONTEXTUAL INTERVIEW INTELLIGENCE • ANTHROPIC"
  - text: "⚡ FRONTIER LAB • ML Systems Engineer"
  - text: "Calibrated for upcoming Anthropic Technical Interview round..."
  - text: "PRIORITY FOCUS TOPICS: Distributed Systems, PyTorch & CUDA, FlashAttention"
```
