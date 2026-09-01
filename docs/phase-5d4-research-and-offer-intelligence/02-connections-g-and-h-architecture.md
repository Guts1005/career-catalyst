# 02. Connections G & H: Architecture & Flow Contracts

## 1. Connection G: Technical Question Bank ➔ Research Library Citations

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant Bank as /interview-prep
    participant Registry as interviewIntelligenceRegistry.ts
    participant Library as /resources

    Candidate->>Bank: Views technical problem (e.g. FlashAttention-2 Online Softmax)
    Bank->>Registry: Resolves question metadata + attaches citedPaper
    Bank->>Candidate: Displays "📄 Peer-Reviewed Research Paper Citation" Card
    Candidate->>Bank: Clicks [ 📖 READ PAPER IN LIBRARY → ]
    Bank->>Library: Navigates with ?paper=FlashAttention-2&arxiv=2307.08691
    Library->>Candidate: Displays "📖 REFERENCED IN ACTIVE INTERVIEW PREP" Banner
    Library->>Candidate: Auto-filters & highlights FlashAttention-2 card with arXiv PDF link
    Candidate->>Library: Clicks [ 🎯 RETURN TO INTERVIEW PREP → ]
```

---

## 2. Connection H: Job Pipeline Offer Stage ➔ Total Compensation & Equity Modeling

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant Pipeline as /job-tracker
    participant Modeler as /salary-insights
    participant Engine as CompensationEquityModeler.js

    Candidate->>Pipeline: Moves job application to "Offer" or "Negotiation" Stage
    Pipeline->>Candidate: Displays "🎉 ACTIVE OFFER & NEGOTIATION STAGE" Banner in Drawer
    Candidate->>Pipeline: Clicks [ 💰 MODEL OFFER & EQUITY SCENARIOS → ]
    Pipeline->>Modeler: Navigates with ?company=Anthropic&base=235000&equity=180000
    Modeler->>Candidate: Displays "🎉 ACTIVE OFFER MODELING & NEGOTIATION • ANTHROPIC" Banner
    Modeler->>Engine: Hydrates 4-year RSU waterfall ($720k grant, $235k base, +Appreciation)
    Candidate->>Modeler: Generates data-backed negotiation script citing Market 90th Percentile
```
