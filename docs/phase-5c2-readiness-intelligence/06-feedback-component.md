# 06. Readiness Intelligence Feedback Component Specification

## 1. Component Design & Layout Specification

The structured feedback notification is rendered within [`src/components/Toast.js`](file:///E:/career-catalyst/src/components/Toast.js):

```text
┌────────────────────────────────────────────────────────┐
│ ✓ CERTIFICATION VERIFIED                           [×] │
│                                                        │
│ AWS Certified Machine Learning – Specialty             │
│ Verified Amazon Web Services credential added bonus     │
│ evidence to Pipeline & Interview Readiness.            │
│                                                        │
│ ┌───────────────────────────┬────────────────────────┐ │
│ │ PIPELINE & READINESS      │ OVERALL READINESS      │ │
│ │ 51% → 56% (+5%)           │ 63% → 64% (+1%)        │ │
│ └───────────────────────────┴────────────────────────┘ │
│                                                        │
│ 🎯 NEXT ACTION: Prepare Technical Sy...                │
│                                 [ VIEW NEXT ACTION → ] │
└────────────────────────────────────────────────────────┘
```

---

## 2. Design Tokens & Styling Properties

* **Position**: Fixed at `bottom: 24px; right: 24px; z-index: 9999;` (non-intrusive, does not obscure top navigation or sidebar).
* **Accent Line**: `4px` solid green border on left (`var(--green)`).
* **Surface Background**: `var(--bg-surface)` with deep drop shadow (`0 8px 30px rgba(0, 0, 0, 0.45)`).
* **Accessibility**: Native `<button aria-label="Dismiss...">`, `role="status"`, and `aria-live="polite"`.
* **Keyboard Navigation**: Pressing `Escape` instantly dismisses all active toasts.
