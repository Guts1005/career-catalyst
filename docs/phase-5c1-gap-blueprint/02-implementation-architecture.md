# 02. Connection A: Implementation Architecture & Flow Contract

## 1. End-to-End System Architecture

Connection A implements a deterministic, explainable bridge between calculated candidate skill deficits and production-grade engineering blueprints.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Analytics as /analytics (AnalyticsPage)
    participant Skills as /skills (SkillsPage)
    participant Registry as gapBlueprintRegistry.ts
    participant Router as Next.js Router
    participant Generator as /project-generator (ProjectGeneratorPage)
    participant Context as CareerContext.js

    User->>Analytics: Views Skill Gap Radar
    Analytics->>Registry: findBlueprintRecommendation(topGap.name)
    Registry-->>Analytics: Return GapBlueprintMapping
    Analytics->>User: Renders Explainable GapBlueprintCard (What, Why, Build, Outcome)
    User->>Analytics: Clicks "VIEW BLUEPRINT & SPECS →"
    Analytics->>Router: Navigate to /project-generator?gap=...&blueprint=...
    Router->>Generator: Mount with query parameters
    Generator->>Registry: Validate gap and blueprint query parameters
    Generator->>User: Displays Contextual Resolution Banner + Highlights Blueprint Card
    User->>Generator: Clicks "+ IMPORT TO PORTFOLIO EVIDENCE"
    Generator->>Context: Appends project with milestones & refreshes state
    Context-->>User: Score recalculates; Gap resolved in Competency Matrix
```

---

## 2. Architectural Invariants Enforced

1. **Grounded in Real Data**: Gaps are strictly calculated by `calculateCareerReadiness` from real user skill ratings vs role target levels.
2. **Explainable Recommendations**: Cards answer all 4 core questions:
   * *WHAT is weak?*
   * *WHY does it matter?*
   * *WHAT should I build?*
   * *WHAT will improve?*
3. **Explicit URL Contract**: Uses `/project-generator?gap={gapSlug}&blueprint={blueprintSlug}` to allow deep-linking, browser refreshes, and direct navigation.
4. **Zero Forced Recommendations**: When no blueprint is registered for a skill, the UI gracefully omits the CTA or displays a neutral fallback.
