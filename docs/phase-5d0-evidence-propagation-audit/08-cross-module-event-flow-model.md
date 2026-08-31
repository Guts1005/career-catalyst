# 08. Cross-Module Event Flow Model & Unified Intelligence Ecosystem

## 1. Unified Event Flow Diagram

```mermaid
graph TD
    subgraph PHASE 1: TARGETING & GAP ANALYSIS
        TR[Target Role Calibrated] --> SK[Skill Proficiency Evaluated]
        SK --> GAP[Competency Deficits Derived]
    end

    subgraph PHASE 2: EVIDENCE ACQUISITION
        GAP -->|Conn A| BP[System Blueprints Recommended]
        BP -->|Import| PRJ[Portfolio Case Studies with Milestones]
        PRJ -->|Conn B| ML[Milestones & Code Verified]
        ATS[ATS Keyword Proof] -->|Conn F| RES[Resume Canvas Auto-Synced]
        PAP[Research Papers] -->|Conn G| LIB[Research Library Synced]
    end

    subgraph PHASE 3: TELEMETRY & FEEDBACK
        ML --> TEL[Unified Readiness Telemetry Recalculated]
        RES --> TEL
        LIB --> TEL
        TEL -->|Conn B| TST[Structured Real-Time Causal Feedback]
        TEL --> NBA[Next Best Action Updated]
    end

    subgraph PHASE 4: APPLICATION & INTERVIEWING
        NBA --> JOB[Job Pipeline Applications]
        JOB -->|Conn E| PIT[Pitch Studio 1-Click Tailored Letters]
        JOB -->|Conn C| INT[Contextual Technical Question Bank]
        JOB -->|Conn D| MCK[AI Mock Interview Simulator]
        JOB -->|Conn H| SAL[Offer Equity Modeling & Negotiation Scripts]
    end
```

---

## 2. Event Propagation Table

| Event / Mutation | Originating Page | Target Destination | Propagated Payload |
| :--- | :--- | :--- | :--- |
| `BLUEPRINT_RECOMMENDED` | `/analytics`, `/skills` | `/project-generator` | `{ gapId, blueprintId, domain }` |
| `ATS_EVIDENCE_INJECTED` | `/ats-checker` | `/resume-builder` | `{ skillName, projectName, formattedBullet }` |
| `MILESTONE_COMPLETED` | `/projects` | Global Toast, Dashboard | `{ projectId, milestoneName, scoreDelta }` |
| `INTERVIEW_ACTIVE` | `/job-tracker` | `/interview-prep`, `/mock-interview` | `{ company, role, stage, focusTopics }` |
| `OFFER_RECEIVED` | `/job-tracker` | `/salary-insights` | `{ company, role, base, equity, bonus }` |
| `RESEARCH_STUDIED` | `/resources` | `/interview-prep`, Dashboard | `{ paperId, topic, theoryCompetencyBoost }` |
