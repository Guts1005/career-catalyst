# 10. Accessibility (a11y) Verification

## 1. WCAG 2.1 AA Compliance Verification

| Accessibility Criteria | Target Feature | Verification Detail | Status |
| :--- | :--- | :--- | :---: |
| **1.3.1 Info & Relationships** (Level A) | Simulation Selector & Context Banner | Semantic `<div role="region" aria-label="...">` landmarks. | **PASS** |
| **2.4.4 Link Purpose in Context** (Level A) | Toolbar Switcher Buttons | Descriptive aria-labels (e.g. `Configure mock interview for Anthropic`). | **PASS** |
| **2.4.7 Focus Visible** (Level AA) | Simulation Textarea & Controls | High-contrast `2px solid var(--purple)` focus indicators on `:focus-visible`. | **PASS** |
| **1.4.3 Contrast (Minimum)** (Level AA) | Badges & Score Display | Score contrast (16.4:1), timer contrast (12.2:1), focus badge contrast (5.6:1). | **PASS** |
| **2.1.1 Keyboard Navigation** (Level A) | Simulation Flow & Pagination | `Tab`, `Space`, `Enter` fully operate question navigation and submission. | **PASS** |

---

## 2. Screen Reader Accessibility Tree

```text
- region "Active Interview Simulation Selector"
  - text: "⚡ ACTIVE INTERVIEW PIPELINES:"
  - button: "Configure mock interview for Anthropic"
  - button: "Configure mock interview for NVIDIA"
  - button: "Standard Tracks ✕"
- region "Calibrated simulation rubric for Anthropic"
  - text: "🎯 CONTEXTUAL SIMULATION RUBRIC • ANTHROPIC"
  - text: "⚡ FRONTIER LAB • ML Systems Engineer"
  - text: "Calibrated for upcoming Anthropic technical screen..."
  - text: "EVALUATED FOCUS AREAS: Distributed Systems, PyTorch & CUDA, FlashAttention"
```
