# 04. ATS Checker Integration Specification

## 1. Scanner Bridge Affordance

In [`src/app/ats-checker/page.js`](file:///E:/career-catalyst/src/app/ats-checker/page.js), the diagnostic results section features a dedicated Connected Intelligence banner:

```text
┌────────────────────────────────────────────────────────┐
│ 📋 RESUME CANVAS EVIDENCE SYNC                         │
│ Injected keywords generate structured achievement      │
│ bullets ready for 1-click insertion into your resume.  │
│                                                        │
│ [ VIEW RESUME CANVAS → ]                               │
└────────────────────────────────────────────────────────┘
```

---

## 2. Interaction Contract

* **Keyword Injection**: Clicking `+ INJECT` on missing keywords triggers `injectATSProof(keyword, projectEvidence)`.
* **Deep-Link**: Clicking `VIEW RESUME CANVAS →` navigates directly to `/resume-builder`.
* **Non-Destructive Flow**: Injected items remain preserved across client navigations via `CareerContext`.
