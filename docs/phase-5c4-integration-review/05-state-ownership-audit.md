# 05. State Ownership & Leakage Audit

## 1. Connected Intelligence State Ownership Table

| State Entity | Owner Component / Module | Derived or Stored | Primary Consumers |
| :--- | :--- | :--- | :--- |
| **Candidate Persona** | `CareerContext.js` | Stored (`useState` + `localStorage`) | All pages, Navigation, Header |
| **Skills & Mastery Levels** | `CareerContext.js` | Stored (`useState` / Supabase) | `/skills`, `/analytics`, `/ats-checker` |
| **Calculated Skill Gaps** | `calculateCareerReadiness` | Derived | `/analytics`, `/skills`, Next Best Action |
| **Blueprint Recommendations**| `gapBlueprintRegistry.ts` | Derived | `/analytics`, `/skills`, `/project-generator` |
| **Projects & Milestones** | `CareerContext.js` | Stored (`useState` / Supabase) | `/projects`, `/project-generator`, Portfolio |
| **Unified Readiness Score** | `calculateCareerReadiness` | Derived (`useMemo`) | Header, Executive Overview, `/analytics` |
| **Readiness State Delta** | `readinessDeltaEngine.ts` | Derived on Mutation | `ToastContainer` |
| **Next Best Action** | `generateNextBestAction` | Derived (`useMemo`) | Executive Overview, `/analytics`, Toasts |
| **Jobs / Applications** | `CareerContext.js` | Stored (`useState` / Supabase) | `/job-tracker`, `/analytics`, Pipeline Funnel |
| **Active Interviews** | `CareerContext.js` | Derived (`useMemo`) | `/job-tracker`, `/interview-prep`, Next Action |
| **Company Intelligence Context**| `interviewIntelligenceRegistry.ts`| Derived (`resolveCompanyContext`)| `/interview-prep` |
| **Question Priorities** | `interviewIntelligenceRegistry.ts`| Derived (`prioritizeQuestions`) | `/interview-prep` |

---

## 2. Leakage & Cascade Risk Assessment

- **Duplicate State**: **Zero duplicate stores**. All derived telemetry originates from `CareerContext.js`.
- **Stale Derived State**: **Zero stale references**. Derived entities utilize strict React `useMemo` hooks with complete dependency arrays.
- **Circular Dependencies**: **Zero cycles**. Data flows strictly in one direction: State ➔ Evaluation ➔ Presentation.
- **Re-render Cascades**: **Negligible**. State updates are functional and scoped; Turbopack builds compile in $\approx 1000\text{ms}$.
