# 05. Resume Canvas Context Flow & Page Architecture

## 1. UI Hierarchy & Evidence Ingestion

In [`src/app/resume-builder/page.js`](file:///E:/career-catalyst/src/app/resume-builder/page.js):

```text
+---------------------------------------------------------------------------------------+
| ATS RESUME BUILDER & LATEX EXPORT.                                                    |
| [ 📝 COPY MARKDOWN ]  [ 📄 COPY LATEX CODE ]  [ 💾 JSON RESUME ]  [ SAVE RESUME ✓ ]   |
+---------------------------------------------------------------------------------------+
|                                                                                       |
| [ Contact & Identity Card ]               | [ Clean Printable Paper Preview ]         |
| [ Professional Summary Card ]             |  - Full Name, Contact, GitHub, LinkedIn   |
| [ Work Experience & Research Card ]       |  - Professional Summary                   |
|   - Role, Company, Bullets                |  - Verified Skills List                   |
|                                           |  - Experience & Research Bullets          |
| [ 📋 ATS Evidence Bullets — Pending ]     |  - Key Projects & Artifacts               |
|   - FlashAttention (from Triton Gateway)  |  - Education History                      |
|     [ ✓ ACCEPT & INSERT ]  [ ✕ ]          |                                           |
+---------------------------------------------------------------------------------------+
```

---

## 2. Dynamic Feature Checklist

- [x] **Context Bullet Subscription**: Dynamically renders pending ATS bullets as they arrive from `CareerContext`.
- [x] **1-Click Insert**: Appends the formatted STAR bullet directly into the active experience entry.
- [x] **1-Click Dismiss**: Allows the candidate to dismiss unwanted suggestions.
- [x] **Instant Paper & Code Export Sync**: Accepted bullets immediately reflect in the Overleaf LaTeX generator and Markdown resume view.
