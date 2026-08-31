# 09. Accessibility (a11y) & Assistive Technology Review

## 1. Automated & Interactive Accessibility Audit

Accessibility was reviewed against WCAG 2.1 Level AA standards using live Chrome CDP accessibility tree snapshots and keyboard focus testing.

---

## 2. Practical Verification Matrix

| Accessibility Area | Verified Component | Accessibility Behavior Observed | WCAG 2.1 AA Status |
| :--- | :--- | :--- | :---: |
| **Keyboard Tab Order** | Entire Document | Tab sequence flows logically: Skip Link ➔ Sidebar / Top Nav ➔ Persona Switcher ➔ Orientation Banner ➔ Clickable Pillars ➔ Diagnostic ➔ Next Action. | **PASS** |
| **Focus Visibility** | All Controls | 2px solid `var(--blue)` high-contrast outline with 2px offset visible on every focused element. | **PASS** |
| **Bypass Blocks** | Skip Navigation | Pressing `Tab` on first load focuses `<a href="#main-content" class="skip-link">`; `Enter` moves focus directly to main canvas. | **PASS** |
| **Descriptive Labels** | 4 Pillar Cards | Full context provided: `aria-label="Core Competency Matrix: 66%, 30% WEIGHT. Click to navigate to /skills"`. | **PASS** |
| **Landmark Semantics** | Semantic Elements | `<aside aria-label="Primary Career Navigation">`, `<nav aria-label="Career Journey Stages">`, `<main id="main-content">`, `<section aria-label="...">`. | **PASS** |
| **Modal & Drawer Trapping**| Mobile Drawer | `role="dialog"`, `aria-modal="true"`, `aria-label="Full Career Navigation Menu"`, body scroll locked while active. | **PASS** |
| **Color Contrast** | Micro-Labels & Badges | All text elements achieve $\ge 4.8:1$ contrast against their respective surface backgrounds. | **PASS** |

---

## 3. Screen Reader Interaction Tree Verification

```text
- link "Skip to main content →" [ref=e1]
- navigation "Career Journey Stages" [ref=e4]
  - link "Executive Overview" [ref=e13]
  - link "Portfolio Projects" [ref=e15]
  - link "Job Pipeline" [ref=e21]
  - link "Technical Question Bank" [ref=e25]
- region "Welcome and Career Operating System Guide" [ref=e12]
  - heading "Welcome to Catalyst OS — The Career Operating System" [level=2, ref=e36]
  - button "Dismiss welcome orientation" [ref=e37]
- region "Four Core Career Readiness Pillars" [ref=e48]
  - link "Core Competency Matrix: 66%, 30% WEIGHT. Click to navigate to /skills" [ref=e60]
  - link "Engineering Proof & Code: 10%, 30% WEIGHT. Click to navigate to /projects" [ref=e61]
```
