# 02. Connection D: Architecture & Flow Contract

## 1. End-to-End Architectural Flow

Connection D bridges active job applications in Job Tracker with the AI Mock Interview Simulator:

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant Pipeline as /job-tracker
    participant Context as CareerContext.js
    participant Simulator as /mock-interview
    participant API as /api/mock-interview
    participant DeltaEngine as readinessDeltaEngine.ts
    participant Toast as Toast.js

    Candidate->>Pipeline: Views Active Application (Anthropic, NVIDIA, OpenAI)
    Pipeline->>Simulator: Clicks [🎙️ SIMULATE ROUND →]
    Simulator->>Context: Reads activeInterviews & resolveCompanyContext()
    Simulator->>API: GET /api/mock-interview?company=Anthropic
    API-->>Simulator: Returns company-calibrated architectural questions & hints
    Simulator->>Candidate: Displays Contextual Simulation Rubric Banner
    Candidate->>Simulator: Completes 15-min round & clicks SUBMIT
    Simulator->>API: POST /api/mock-interview
    API-->>Simulator: Returns diagnostic scorecard (Score: 94%, Top 2.8% Percentile)
    Simulator->>Context: Calls syncSolvedProblem()
    Context->>DeltaEngine: Evaluates readiness delta
    Context->>Toast: Renders structured causal feedback toast
```

---

## 2. Invariants & Guarantees

1. **Deterministic Auto-Configuration**: Navigating with `?company=Anthropic` immediately loads Anthropic's frontier systems simulation track.
2. **One-Click Switcher**: Candidates can easily toggle between different active interview companies or reset to standard domain tracks (`ML System Design`, `Deep Learning Math`, `Behavioral`).
3. **Causal Evidence Feedback**: Completing a simulation scores technical depth and automatically feeds back into the candidate's unified career readiness score via Connection B.
