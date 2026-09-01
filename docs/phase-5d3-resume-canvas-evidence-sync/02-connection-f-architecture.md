# 02. Connection F: Architecture & Flow Contract

## 1. End-to-End Architectural Flow

Connection F bridges ATS Keyword gap discovery in `/ats-checker` with the editable Resume Canvas in `/resume-builder`:

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant Scanner as /ats-checker
    participant Context as CareerContext.js
    participant DeltaEngine as readinessDeltaEngine.ts
    participant Toast as Toast.js
    participant Canvas as /resume-builder

    Candidate->>Scanner: Clicks [+ INJECT] on missing keyword (e.g. FlashAttention)
    Scanner->>Context: Calls injectATSProof("FlashAttention", "Triton Gateway")
    Context->>Context: Upgrades skill evidence to VERIFIED tier
    Context->>Context: Formats structured STAR bullet & adds to injectedBullets queue
    Context->>DeltaEngine: Evaluates readiness delta
    Context->>Toast: Structured Toast explains delta + indicates bullet ready
    Candidate->>Canvas: Navigates to /resume-builder
    Canvas->>Context: Reads injectedBullets
    Canvas->>Candidate: Displays "📋 ATS Evidence Bullets — Pending Review" Card
    Candidate->>Canvas: Clicks [✓ ACCEPT & INSERT]
    Canvas->>Canvas: Appends bullet to active Experience list
    Canvas->>Context: Calls acceptInjectedBullet(bulletId)
```

---

## 2. Invariants & Guarantees

1. **Structured Synthesis Guarantee**: Injected bullets follow the rigorous formula:
   $$\text{Strong Action Verb} + \text{Technical Tool} + \text{Architectural Detail} + \text{Quantitative Metric}$$
2. **Review-Before-Save Safety**: Injected bullets are staged in a dedicated pending review panel and are never forced into the resume without candidate consent.
3. **Continuous State Synchrony**: Once accepted, bullets update both the live form textarea, Overleaf LaTeX export, GitHub Markdown export, and clean paper preview instantly.
