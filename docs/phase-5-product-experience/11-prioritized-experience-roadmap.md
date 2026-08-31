# 11. Prioritized Product Experience Roadmap

## 1. Prioritization Framework

Experience improvements are prioritized using the **Impact vs. Effort Matrix**:
* **P0**: Product Clarity Blockers (Immediate confusion or orientation issues).
* **P1**: Core Experience & Connectivity Improvements (High-frequency daily workflows).
* **P2**: Engagement & Intelligence Enhancements (Gamification, simulation, and feedback).
* **P3**: Advanced Explorations (Interactive embedding and experimental simulators).

---

## 2. Master Prioritized Experience Roadmap

| Priority | ID | Problem Solved | Proposed Experience Improvement | Affected Pages | Complexity | Product Impact |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **P0** | **EXP-01** | First-time visitor orientation & choice paralysis | **Interactive Welcome Banner & Persona Guided Tour**: 1-sentence prompt explaining Demo Mode with quick persona switch. | `/`, Sidebar | Low | Eliminates 30-second initial confusion. |
| **P0** | **EXP-02** | 18 unsegmented flat sidebar links | **Semantic Information Architecture Restructuring**: Group into Command Center, Engineering Proof, Pipeline, Close. | `Sidebar.js`, `MobileNav.js` | Medium | Reduces cognitive load by 60%. |
| **P0** | **EXP-03** | 4-pillar dashboard cards are static readouts | **Clickable 4-Pillar Deep Links**: Clicking "Competency" jumps to `/skills`, "Portfolio" jumps to `/projects`, etc. | `/` (Dashboard) | Low | Creates intuitive navigation flow from overview. |
| **P1** | **EXP-04** | Gaps shown as raw numbers without action | **Gap-to-Blueprint 1-Click Bridge**: Connect each deficit directly to a recommended project template or problem. | `/analytics`, `/skills` | Medium | Turns passive data into immediate action. |
| **P1** | **EXP-05** | Individual manual keyword injection in ATS | **1-Click "Inject All Verified Proofs"**: Auto-scan project portfolio and inject all matching keywords at once. | `/ats-checker` | Medium | Increases ATS workflow speed by 5x. |
| **P1** | **EXP-06** | Disconnect between applications and prep | **Active Company Question Filtering**: Clicking an interview card in `/job-tracker` auto-filters `/interview-prep`. | `/job-tracker`, `/interview-prep` | Medium | Connects pipeline directly to technical revision. |
| **P1** | **EXP-07** | Silent state synchronization | **Cause-and-Effect Intelligence Toasts**: Display explicit celebration toast when certs or problems upgrade score. | `CareerContext.js`, Toast | Low | Makes system intelligence visible and rewarding. |
| **P2** | **EXP-08** | Uncertainty regarding effort vs payoff | **"What-If" Readiness Simulation Mode**: Interactive toggle checkboxes previewing future score increases. | `/`, `/analytics` | Medium | High engagement and gamified motivation. |
| **P2** | **EXP-09** | Comp calculator isolated from active jobs | **Offer Leverage Auto-Import**: "Negotiate Offer" button in `/job-tracker` pre-fills compensation modeler. | `/job-tracker`, `/salary-insights` | Medium | Connects application wins to financial leverage. |
| **P2** | **EXP-10** | Anti-climactic milestone completions | **Milestone Completion Glow & Badges**: Visual green pulse and unlock animation when all project milestones are done. | `/projects` | Low | Elevates candidate sense of accomplishment. |
| **P3** | **EXP-11** | Isolated algorithm sandbox demo | **Embedded Project Artifact**: Embed Triton latency visualizer directly inside the Triton FlashAttention card. | `/projects`, `/algorithm-sandbox` | Low | Bridges abstract benchmark into tangible proof. |
| **P3** | **EXP-12** | Monolithic text review in resume builder | **Live Side-by-Side PDF Sheet Preview**: Split-pane live PDF canvas rendering during JSON resume edits. | `/resume-builder` | High | Improves document editing fidelity. |
