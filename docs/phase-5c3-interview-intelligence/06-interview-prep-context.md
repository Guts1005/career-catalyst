# 06. Contextual Interview Prep Page Specification

## 1. UI Structure & Contextual Elements

When accessed with active interview context ([`src/app/interview-prep/page.js`](file:///E:/career-catalyst/src/app/interview-prep/page.js)):

```text
+---------------------------------------------------------------------------------------+
| ⚡ ACTIVE INTERVIEW PIPELINES:  [ 🎯 ANTHROPIC (INTERVIEW) ]  [ 🎯 NVIDIA (OA) ] [Clear ✕]|
+---------------------------------------------------------------------------------------+
|                                                                                       |
| 🎯 CONTEXTUAL INTERVIEW INTELLIGENCE • ANTHROPIC                                      |
| ⚡ FRONTIER LAB • ML Systems Engineer                                                  |
| Calibrated for upcoming Anthropic Technical Interview round. High-probability        |
| questions matching their engineering focus have been prioritized at the top.          |
|                                                                                       |
| PRIORITY FOCUS TOPICS: [✓ Distributed Systems] [✓ PyTorch & CUDA] [✓ FlashAttention]   |
+---------------------------------------------------------------------------------------+
|                                                                                       |
| [ 4 Available ]   [ 2 Mastered ]   [ 2 Needs Review ]   [ 2 Target Priorities ]       |
|                                                                                       |
| 01 • ML System Design ★ HIGH PROBABILITY FOR ANTHROPIC                                |
| Explain the mathematical formulation of Online Softmax in FlashAttention-2...         |
| 💡 Targeted for Anthropic's core focus on Online Softmax                              |
|                                                                                       |
| 02 • Distributed Systems ★ HIGH PROBABILITY FOR ANTHROPIC                             |
| Compare Tensor Parallelism (Megatron-LM) vs Pipeline Parallelism (1F1B)...            |
| 💡 Targeted for Anthropic's core focus on Distributed Systems                         |
+---------------------------------------------------------------------------------------+
```

---

## 2. Dynamic Feature Sets

* **Context Switcher**: Top toolbar lets the candidate switch between active interview pipelines in 1 click.
* **Badged Question Cards**: High-probability questions display the `★ HIGH PROBABILITY FOR {COMPANY}` badge and explanation note.
* **Full Bank Access**: Category filters (`All`, `ML System Design`, `Distributed Systems`, etc.) and search input remain fully active.
* **Answer Invariants & Citations**: Expanding questions displays architectural trade-offs, citations (e.g. arXiv links), and benchmark metrics.
