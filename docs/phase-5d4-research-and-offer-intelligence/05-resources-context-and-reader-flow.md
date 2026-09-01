# 05. Research Library Context Flow & Reader Architecture

## 1. UI Hierarchy & Referenced Paper Banner

In [`src/app/resources/page.js`](file:///E:/career-catalyst/src/app/resources/page.js):

```text
+---------------------------------------------------------------------------------------+
| 📖 REFERENCED IN ACTIVE INTERVIEW PREPARATION                                         |
| FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning      |
| This peer-reviewed paper was cited as the empirical theoretical foundation.           |
| [ 🎯 RETURN TO INTERVIEW PREP → ]   [ Clear ✕ ]                                       |
+---------------------------------------------------------------------------------------+
|                                                                                       |
| [ Total Archive: 6 Papers ]  [ Completed: 5 Studied ]  [ Avg Depth: 5.0/5.0 ]         |
| [ Search input: FlashAttention-2 ]                                                    |
|                                                                                       |
| ┌───────────────────────────────────────────────────────────────────────────────────┐ |
| │ [GPU KERNEL ARCHITECTURE] [arXiv:2307.08691]                                       │ |
| │ FlashAttention-2: Faster Attention with Better Parallelism...                     │ |
| │ 👤 Tri Dao (Stanford / Together AI) (2023)                                         │ |
| │ Eliminates non-matmul FLOPs, optimizes thread block tiling for GPU SRAM...        │ |
| │ [ ✓ Read ]  [ arXiv ↗ ]                                                            │ |
| └───────────────────────────────────────────────────────────────────────────────────┘ |
+---------------------------------------------------------------------------------------+
```

---

## 2. Dynamic Feature Checklist

- [x] **URL Parameter Ingestion**: Reads `paper`, `arxiv`, `from` query params safely via `<Suspense>`.
- [x] **Auto Search Pre-Fill**: Pre-populates search box to isolate the referenced paper card instantly.
- [x] **Purple Border Highlight**: Adds high-contrast glow (`box-shadow: 0 0 12px rgba(168, 85, 247, 0.2)`) to target card.
- [x] **1-Click Return**: Deep-link back to `/interview-prep` preserves candidate workflow continuity.
