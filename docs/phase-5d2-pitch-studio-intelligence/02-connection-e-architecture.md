# 02. Connection E: Architecture & Flow Contract

## 1. End-to-End Architectural Flow

Connection E connects target job applications directly to the **Pitch Studio** ([`/cover-letter`](file:///E:/career-catalyst/src/app/cover-letter/page.js)):

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant Pipeline as /job-tracker
    participant Context as CareerContext.js
    participant Studio as /cover-letter
    participant API as /api/cover-letter
    participant Toast as Toast.js

    Candidate->>Pipeline: Views target role (Anthropic, NVIDIA, OpenAI)
    Pipeline->>Studio: Clicks [ 📝 GENERATE TAILORED PITCH → ]
    Studio->>Context: Reads candidate's verified projects & skill evidence
    Studio->>API: POST { company, role, requiredSkills, candidate_projects, candidate_skills }
    API-->>Studio: Returns tailored STAR cover letter & recruiter InMail pitch
    Studio->>Candidate: Displays customized letter embedding real project case studies
    Studio->>Toast: Structured Toast confirms pitch generation with verified evidence
```

---

## 2. Core Architectural Guarantees

1. **Deterministic Auto-Fill**: Navigating via `?company=...&role=...&skills=...` pre-populates all form inputs automatically.
2. **Real Project Injection**: Generates custom STAR paragraphs embedding the candidate's top verified case studies (e.g. *Triton Inference Gateway with 13.8ms P99 latency*).
3. **Dual Artifact Output**: Simultaneously produces a full formal STAR cover letter and a concise 120-word LinkedIn InMail recruiter outreach pitch.
