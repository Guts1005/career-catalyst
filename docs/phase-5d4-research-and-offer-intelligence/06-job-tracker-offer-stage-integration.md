# 06. Job Tracker Offer Stage Integration Specification

## 1. Offer Stage Affordance in Preview Drawer

In [`src/app/job-tracker/page.js`](file:///E:/career-catalyst/src/app/job-tracker/page.js):

```text
┌────────────────────────────────────────────────────────┐
│ 🎉 ACTIVE OFFER & NEGOTIATION STAGE                    │
│ Model multi-year RSU waterfalls, base/bonus splits,    │
│ and leverage scripts for Anthropic.                    │
│                                                        │
│ [ 💰 MODEL OFFER & EQUITY SCENARIOS → ]                │
└────────────────────────────────────────────────────────┘
```

---

## 2. Interaction Contract

* **Link Target**: Navigates to `/salary-insights?company={company}&role={role}&base={base}&equity={equity}&bonus={bonus}&stage={stage}`.
* **Auto-Calibration**: Pre-populates the salary modeler with real compensation numbers and initializes the 4-year waterfall simulator.
