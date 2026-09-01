# 11. Accessibility (a11y) Verification

## 1. WCAG 2.1 AA Compliance Verification

| Accessibility Criteria | Target Feature | Verification Detail | Status |
| :--- | :--- | :--- | :---: |
| **1.3.1 Info & Relationships** (Level A) | Offer Selector & Paper Banners | Semantic `<div role="region" aria-label="...">` landmarks. | **PASS** |
| **2.4.4 Link Purpose in Context** (Level A) | Action CTAs | Descriptive labels (`Model compensation for Anthropic`, `Read paper in library`). | **PASS** |
| **4.1.2 Name, Role, Value** (Level A) | Range Sliders | Accessible `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`. | **PASS** |
| **1.4.3 Contrast (Minimum)** (Level AA) | Badges & Text | Amber offer badge (7.2:1), purple citation banner (8.4:1), button labels (14.2:1). | **PASS** |
| **2.1.1 Keyboard Navigation** (Level A) | Sliders & Links | Range inputs respond to `ArrowLeft`, `ArrowRight`, `Home`, `End`. | **PASS** |

---

## 2. Screen Reader Accessibility Tree

```text
- region "Active Offer Pipeline Selector"
  - text: "⚡ ACTIVE OFFERS & PIPELINES:"
  - button: "Model compensation for Anthropic"
  - button: "Clear Context ✕"
- region "Active Offer Modeling for Anthropic"
  - text: "🎉 ACTIVE OFFER MODELING & NEGOTIATION • ANTHROPIC"
  - text: "STAGE: OFFER"
  - text: "Calibrated for Anthropic (Staff AI Engineer)..."
- slider "Base Salary Amount" (min: 120000, max: 350000, val: 235000)
- slider "4-Year Total Equity Grant Amount" (min: 100000, max: 1200000, val: 720000)
```
