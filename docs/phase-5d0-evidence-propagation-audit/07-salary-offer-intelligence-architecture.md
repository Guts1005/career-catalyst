# 07. Stream 5: Offer Stage & Compensation Intelligence (Connection H)

## 1. Architectural Flow Contract

Connection H bridges the final hiring funnel milestone in Job Tracker ([`/job-tracker`](file:///E:/career-catalyst/src/app/job-tracker/page.js)) with compensation benchmarking and equity modeling ([`/salary-insights`](file:///E:/career-catalyst/src/app/salary-insights/page.js)):

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant Pipeline as /job-tracker
    participant Modeler as /salary-insights
    participant ScriptGen as /api/salary-insights

    Candidate->>Pipeline: Moves application to 'Offers / Decided' stage
    Pipeline->>Candidate: Renders [💰 MODEL OFFER & EQUITY →] CTA on offer card
    Candidate->>Modeler: Clicks CTA; navigates to /salary-insights?company=Anthropic&base=210000&equity=120000
    Modeler->>Modeler: Auto-populates 4-Year RSU waterfall & base/bonus breakdown
    Candidate->>ScriptGen: Clicks [GENERATE COUNTER-OFFER SCRIPT]
    ScriptGen-->>Modeler: Returns high-leverage negotiation script with market percentile data
```

---

## 2. Invariants & Equity Model Data

1. **Offer State Query Contract**: `/salary-insights?company=Anthropic&role=ML%20Systems%20Engineer&base=210000&equity=120000&bonus=30000`.
2. **Benchmark Verification**: Compares offer numbers against verified market 75th and 90th percentiles for the candidate's target role tier.
3. **Negotiation Script Customization**: Crafts counter-proposals leveraging competing interview momentum from active pipeline applications.
