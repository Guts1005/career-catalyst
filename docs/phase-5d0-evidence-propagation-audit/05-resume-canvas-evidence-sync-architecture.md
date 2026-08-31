# 05. Stream 3: Resume Canvas & Evidence Sync Architecture (Connection F)

## 1. Architectural Flow Contract

Connection F closes the loop between ATS Keyword proof injection ([`/ats-checker`](file:///E:/career-catalyst/src/app/ats-checker/page.js)) and the Resume Canvas ([`/resume-builder`](file:///E:/career-catalyst/src/app/resume-builder/page.js)):

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant Scanner as /ats-checker
    participant Context as CareerContext.js
    participant Canvas as /resume-builder
    participant Toast as Toast.js

    Candidate->>Scanner: Clicks [+ INJECT] on missing keyword (e.g. CUDA Kernel Optimization)
    Scanner->>Context: Calls injectATSProof(keyword, projectEvidence)
    Context->>Context: Upgrades skill evidence to VERIFIED tier
    Context->>Context: Appends structured achievement bullet to resumeData
    Context->>Toast: Structured Toast explains score delta + offers [ VIEW RESUME CANVAS → ]
    Candidate->>Canvas: Opens Resume Canvas; sees verified bullet pre-populated in experience
```

---

## 2. Invariants & Transformation Rules

1. **Structured Bullet Formatting**:
   * *Formula*: `[Strong Action Verb] + [Technical System / Tool] + [Architectural Detail] + [Empirical Impact Metric]`.
   * *Example*: *"Engineered high-throughput custom Triton GPU kernels for FlashAttention-2 online softmax tiling, reducing KV-cache memory demand by 45% on H100 clusters."*
2. **Review Before Permanent Save**: The candidate can review, edit, or accept the newly injected bullet point in `/resume-builder` before saving to backend persistence.
