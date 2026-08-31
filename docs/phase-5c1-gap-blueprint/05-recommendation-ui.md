# 05. Explainable Recommendation UI Design

## 1. UI Structure & 4-Question Framework

The recommendation card ([`src/components/GapBlueprintCard.js`](file:///E:/career-catalyst/src/components/GapBlueprintCard.js)) implements the explainability framework:

```text
+---------------------------------------------------------------------------------------+
| ● COMPETENCY DEFICIT IDENTIFIED                 CURRENT: 65% • TARGET: 85% (Δ -20%)   |
|                                                                                       |
| Large-Scale Distributed Systems                                                       |
| Essential evidence for scaling 70B+ parameter models across multi-node GPU clusters.   |
|                                                                                       |
| +-----------------------------------------------------------------------------------+ |
| | RECOMMENDED ARCHITECTURE BLUEPRINT                                                | |
| | Multi-Node Tensor Parallel Inference Engine from Scratch                          | |
| | Implements Megatron-LM tensor parallel linear layers, NCCL All-Reduce, and 1F1B.   | |
| +-----------------------------------------------------------------------------------+ |
|                                                                                       |
| EXPECTED EVIDENCE IMPACT                                                              |
| [↑ Engineering Proof]  [↑ Systems Scaling Evidence]       [ VIEW BLUEPRINT & SPECS → ]|
+---------------------------------------------------------------------------------------+
```

---

## 2. Design Tokens & Styling Treatment

* **Amber Deficit Indicator**: `4px` vertical amber border (`var(--amber)`) on the left of the card immediately signals a target deficit without jarring error styling.
* **Green Blueprint Highlights**: The recommended blueprint box features green typography (`var(--green)`) and a subtle surface background (`var(--bg-subtle)`).
* **Progressive Disclosure**: Detailed situations, STAR formulas, and key implementation milestones are revealed inside the Project Generator rather than crowding the Analytics dashboard.
* **Responsive Stacking**: Stacks gracefully on mobile viewports ($\le 640\text{px}$) with full-width primary CTA buttons.
