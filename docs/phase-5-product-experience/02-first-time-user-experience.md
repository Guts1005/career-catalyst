# 02. First-Time User Experience (FTUX) & Cognitive Load Analysis

## 1. First 30 Seconds Experience Map

```text
[0s - 5s: LANDING & INITIAL GLANCE]
  ├─ Canvas: Dark `#09090B` surface with green terminal accents and monospace metrics.
  ├─ Immediate Focal Points: 
  │    1. Readiness Score ring (63% / 78%)
  │    2. Top candidate badge: "Sharvin Neve • ML Systems Specialist"
  │    3. Three candidate persona selector pills.
  └─ Initial Cognitive Reaction: "This is a serious, high-density engineering platform."

[5s - 15s: TELEMETRY SCAN]
  ├─ User reads 4 KPI Cards: Competency Match, Target Comp ($165k-$220k), Active Applications (3), Skill Gap Deficits (2).
  ├─ Next Best Action Card: "Prepare Technical System Design for Anthropic".
  └─ User Question: "Is this Sharvin's actual personal portfolio, or a SaaS application I can use?"

[15s - 30s: NAVIGATION ENCOUNTER]
  ├─ Eye tracks left to the 18-item sidebar navigation.
  ├─ Sidebar contains 18 items without visual section headers or progressive disclosure.
  └─ Primary Confusion: "Where should I click first? What is the main workflow?"
```

---

## 2. First 5 Minutes Experience Map

| Time Interval | User Action | Perceived System Feedback | User Delight vs. Friction |
| :--- | :--- | :--- | :--- |
| **Minute 1** | Clicks `Elena Rostova` persona pill | Dashboard recomputes: Readiness jumps to 78%, Next Action shifts to OpenAI RAG architecture | **Delight**: Immediate understanding of reactive data binding and role-specific readiness. |
| **Minute 2** | Clicks `ATS Checker` in sidebar | Pastes resume/JD, sees missing keyword `Distributed Systems` with badge `💡 Verified in Triton Gateway`, clicks `+ INJECT` | **High Delight**: The core closed-loop value proposition clicks — project proof resolves ATS keyword deficits. |
| **Minute 3** | Clicks `Algorithm Sandbox` | Drags batch size (1–64) and context window (512–8192) sliders; watches Triton vs vLLM P99 latency bars animate | **High Delight**: Proves authentic systems engineering depth rarely seen in web apps. |
| **Minute 4** | Clicks `Salary Insights` | Interacts with Equity & Appreciation sliders; sees 4-year total comp projection ($285k/yr) | **Value Realization**: Connects technical skill mastery directly to financial upside. |
| **Minute 5** | Clicks `Resources` | Views arXiv papers, presses `/` to search, reads Triton MAPL paper notes | **Discovery**: Realizes the breadth of the ecosystem, but wonders how paper reading connects back to overall score. |

---

## 3. Cognitive Overload & Friction Points

### 1. Flat Sidebar Taxonomy (18 Unsegmented Links)
* **Problem**: The sidebar presents 18 items with uniform visual weight from top to bottom.
* **Impact**: Creates choice paralysis for new users. Users cannot distinguish between daily workflows (`/job-tracker`, `/ats-checker`), reference databases (`/resources`, `/salary-insights`), and developer utilities (`/project-generator`, `/algorithm-sandbox`).

### 2. Missing "Demo Tour / Guided Walkthrough"
* **Problem**: New visitors are not explicitly told that the app is in **Interactive Public Demonstration Mode**.
* **Impact**: Visitors spend their first 60 seconds wondering if they need to log in or create an account before realizing they can freely switch personas and trigger simulations.

### 3. Invisible Cause-and-Effect Explanations
* **Problem**: When a user completes a problem in `/coding-tracker` or adds a paper in `/resources`, the global readiness score changes, but there is no toast or banner explaining *why* (e.g. `"+5 Points added to Pipeline Readiness via NVIDIA DLI Certification"`).
