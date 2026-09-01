# 04. Technical Question Bank & Research Integration Specification

## 1. Question Bank Card Affordance

In [`src/app/interview-prep/page.js`](file:///E:/career-catalyst/src/app/interview-prep/page.js), expanding a question displays the dedicated citation block:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 📄 PEER-REVIEWED RESEARCH PAPER CITATION                               │
│ FlashAttention-2: Faster Attention with Better Parallelism             │
│ Tri Dao (Stanford / Together AI) (2023) • Eliminates quadratic HBM I/O │
│ bottlenecks via online softmax tiling directly in on-chip SRAM.        │
│                                                                        │
│ [ 📖 READ PAPER IN LIBRARY → ]                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Interaction Contract

* **Link Target**: Navigates to `/resources?paper={title}&arxiv={arxivId}&from=interview-prep`.
* **Deep Linking**: Transmits paper title and arXiv DOI for instant search pre-filtering and visual border highlight in the reading repository.
