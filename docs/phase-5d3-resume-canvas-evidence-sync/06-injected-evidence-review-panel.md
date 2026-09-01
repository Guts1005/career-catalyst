# 06. Injected Evidence Review Panel Specification

## 1. Evidence Review Card Layout

The pending evidence panel renders automatically whenever `injectedBullets.filter(b => !b.accepted).length > 0`:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 📋 ATS Evidence Bullets — Pending Review (2)                           │
│ These structured achievement bullets were generated from your ATS      │
│ Keyword Matcher injections. Accept to insert into your resume.         │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [FlashAttention] from Triton Low-Latency Inference Gateway          │ │
│ │ [✓ ACCEPT & INSERT]  [✕]                                           │ │
│ │ Implemented FlashAttention-2 online softmax tiling with custom     │ │
│ │ SRAM management, reducing KV-cache memory demand by 45% on multi-  │ │
│ │ GPU inference clusters.                                            │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Interaction State Logic

* **Accept**: Inserts bullet text into `experienceList[0].bullets` and marks `bullet.accepted = true`.
* **Dismiss**: Calls `dismissInjectedBullet(bullet.id)` to remove the card from the queue.
* **Zero Layout Glitch**: Disappearing cards collapse smoothly with no layout jumping.
