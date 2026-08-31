# 10. Accessibility (a11y) Verification

## 1. WCAG 2.1 AA Compliance Verification

| Accessibility Criteria | Target Feature | Verification Detail | Status |
| :--- | :--- | :--- | :---: |
| **1.3.1 Info & Relationships** (Level A) | Target Selector & Context Banner | Semantic `<div role="region" aria-label="...">` landmarks. | **PASS** |
| **2.4.4 Link Purpose in Context** (Level A) | Toolbar Switcher Buttons | Descriptive aria-labels (e.g. `Calibrate pitch for Anthropic`). | **PASS** |
| **2.4.7 Focus Visible** (Level AA) | Input Fields & Copy Buttons | High-contrast `2px solid var(--purple)` focus indicators on `:focus-visible`. | **PASS** |
| **1.4.3 Contrast (Minimum)** (Level AA) | Badges & Text Boxes | Form labels (14.2:1), text inputs (16.4:1), copy buttons (6.2:1). | **PASS** |
| **2.1.1 Keyboard Navigation** (Level A) | Form Submission & Copy Actions | Complete `Tab`, `Space`, and `Enter` keyboard operability. | **PASS** |

---

## 2. Screen Reader Accessibility Tree

```text
- region "Active Job Pipeline Selector"
  - text: "⚡ ACTIVE JOB TARGETS:"
  - button: "Calibrate pitch for Anthropic"
  - button: "Calibrate pitch for NVIDIA"
  - button: "Clear Context ✕"
- region "Calibrated pitch context for Anthropic"
  - text: "🎯 CONTEXTUAL PITCH GENERATOR • ANTHROPIC"
  - text: "VERIFIED PORTFOLIO EVIDENCE CONNECTED"
  - text: "Calibrated for Anthropic (Staff AI Engineer)..."
```
