# 05. Pitch Studio Context Flow & Page Architecture

## 1. UI Structure & Contextual Elements

In [`src/app/cover-letter/page.js`](file:///E:/career-catalyst/src/app/cover-letter/page.js):

```text
+---------------------------------------------------------------------------------------+
| ⚡ ACTIVE JOB TARGETS: [ 🎯 ANTHROPIC ] [ 🎯 NVIDIA ] [ 🎯 OPENAI ] [ Clear Context ✕] |
+---------------------------------------------------------------------------------------+
|                                                                                       |
| 🎯 CONTEXTUAL PITCH GENERATOR • ANTHROPIC                                             |
| VERIFIED PORTFOLIO EVIDENCE CONNECTED                                                 |
| Calibrated for Anthropic (Staff AI Engineer). Generation automatically embeds your    |
| top verified case studies (Triton Inference Gateway, Distributed Systems Engine).     |
+---------------------------------------------------------------------------------------+
|                                                                                       |
| [ Target Role Form ]               |  [ LinkedIn / InMail Pitch Card ]                |
|  - Company: Anthropic              |  - Copy Pitch Button                             |
|  - Role: Staff AI Engineer         |  [ Formal STAR Application Letter Card ]         |
|  - Competencies: PyTorch, Triton   |  - + Add Latency Metric | + Add RAG Metric       |
|  [ GENERATE TAILORED PITCH → ]     |  - Copy Letter Button                            |
+---------------------------------------------------------------------------------------+
```

---

## 2. Dynamic Capabilities

* **Target Switcher Toolbar**: One-click switching between active job applications.
* **Contextual Orientation Banner**: Confirms that real portfolio case studies are attached to the synthesis loop.
* **1-Click Copy Controls**: Dedicated copy buttons for both the formal letter and the short InMail pitch.
