# 04. Stream 2: Pitch Studio & Application Intelligence (Connection E)

## 1. Architectural Flow Contract

Connection E connects Job Tracker applications directly to tailored pitch and cover letter generation ([`/cover-letter`](file:///E:/career-catalyst/src/app/cover-letter/page.js)):

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant Pipeline as /job-tracker
    participant Context as CareerContext.js
    participant Studio as /cover-letter
    participant Generator as /api/cover-letter

    Candidate->>Pipeline: Views target role (e.g. Anthropic, OpenAI)
    Pipeline->>Studio: Clicks [📝 GENERATE TAILORED PITCH →]
    Studio->>Context: Ingests candidate's verified projects & skill evidence
    Studio->>Generator: POST { company, role, requiredSkills, candidateProjects, candidateEvidence }
    Generator-->>Studio: Returns tailored STAR cover letter & recruiter outreach pitch
    Studio->>Candidate: Displays customized letter embedding candidate's real project metrics
```

---

## 2. Invariants & Data Mapping Specified

1. **Auto-Fill Query Contract**: `/cover-letter?company=Anthropic&role=ML%20Systems%20Engineer&skills=PyTorch,CUDA,FlashAttention`.
2. **Project Evidence Injection**: Automatically embeds the candidate's top verified case study (e.g. *Triton Inference Gateway with 13.8ms P99 latency*) directly into paragraph 2 of the cover letter.
3. **Recruiter InMail Customization**: Produces a high-conversion 120-word LinkedIn/InMail message citing the specific role and matching evidence.
