# 05. Mock Interview Context Flow & Page Architecture

## 1. UI Elements and Layout Hierarchy

In [`src/app/mock-interview/page.js`](file:///E:/career-catalyst/src/app/mock-interview/page.js):

```text
+---------------------------------------------------------------------------------------+
| ⚡ ACTIVE INTERVIEW PIPELINES: [ 🎯 ANTHROPIC (INTERVIEW) ] [ 🎯 NVIDIA (OA) ] [Std ✕]|
+---------------------------------------------------------------------------------------+
|                                                                                       |
| 🎯 CONTEXTUAL SIMULATION RUBRIC • ANTHROPIC                                           |
| ⚡ FRONTIER LAB • ML Systems Engineer                                                  |
| Calibrated for upcoming Anthropic technical screen. Rubric evaluates engineering      |
| accuracy on Anthropic's core technology stack.                                        |
|                                                                                       |
| EVALUATED FOCUS AREAS: [✓ Distributed Systems] [✓ PyTorch & CUDA] [✓ FlashAttention]   |
+---------------------------------------------------------------------------------------+
|                                                                                       |
| [ BEGIN 15-MIN ANTHROPIC SIMULATION → ]                                               |
+---------------------------------------------------------------------------------------+
```

---

## 2. Dynamic Feature Checklist

- [x] **Active Pipeline Toolbar**: Displays interactive switcher buttons for all active applications.
- [x] **Company Calibration Banner**: Highlights tier badge, target role, and evaluated focus areas.
- [x] **15-Minute Countdown Timer**: Persistent timer badge with automated submission upon expiry.
- [x] **Benchmark Loader**: Injects company-tailored architectural answers for rapid benchmarking.
- [x] **Scorecard Diagnostic**: Displays breakdown across Technical Accuracy, System Architecture, and Trade-off Analysis.
