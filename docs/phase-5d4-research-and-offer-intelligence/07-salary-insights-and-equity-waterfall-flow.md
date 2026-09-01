# 07. Salary Insights & Equity Waterfall Context Flow

## 1. UI Hierarchy & Offer Modeling Elements

In [`src/app/salary-insights/page.js`](file:///E:/career-catalyst/src/app/salary-insights/page.js):

```text
+---------------------------------------------------------------------------------------+
| ⚡ ACTIVE OFFERS: [ 💰 ANTHROPIC ($485k) ] [ 💰 NVIDIA ($520k) ] [ Clear Context ✕ ]   |
+---------------------------------------------------------------------------------------+
|                                                                                       |
| 🎉 ACTIVE OFFER MODELING & NEGOTIATION • ANTHROPIC                                    |
| Calibrated for Anthropic (Staff AI Engineer). Initial Offer: $235k Base + $180k/yr    |
| Equity. Modeled target negotiation delta is +$45k.                                    |
+---------------------------------------------------------------------------------------+
|                                                                                       |
| [ Market Benchmarks Table ]        | [ Data-Backed Counter-Offer Script Form ]        |
|  - Role & Level                    |  - Company: Anthropic                            |
|  - Median Total Comp: $380,000     |  - Base: $235,000 | Equity: $180,000             |
|                                    |  - Target: $505,000 | Leverage: Competing Offers |
| [ Target Offer Breakdown Bar ]     |  [ GENERATE NEGOTIATION SCRIPT → ]               |
|  - Base: 51% | Equity: 39% | Bonus |                                                  |
+---------------------------------------------------------------------------------------+
|                                                                                       |
| [ 4-Year Total Compensation & RSU Waterfall Modeler ]                                 |
|  - Sliders: Base ($235k), Equity Grant ($720k), Bonus (19%), Appreciation (10%/yr)    |
|  - Stacked Year 1 to Year 4 Total Earnings Chart                                      |
+---------------------------------------------------------------------------------------+
```

---

## 2. Dynamic Feature Checklist

- [x] **Active Offer Switcher Toolbar**: One-click selection of active offers from pipeline.
- [x] **Contextual Negotiation Banner**: Confirms calibrated offer parameters.
- [x] **Reactive Waterfall Modeler**: 4-year cumulative compensation charts update in real-time as sliders drag.
- [x] **Counter-Offer Generator**: Creates professional negotiation scripts with delta calculations.
