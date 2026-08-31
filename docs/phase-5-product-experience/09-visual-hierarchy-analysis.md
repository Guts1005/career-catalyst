# 09. Visual Hierarchy, Information Density & Design Rhythm

## 1. Visual Focal Point Hierarchy

The live production design of Catalyst OS features a dark, disciplined engineering aesthetic inspired by high-frequency developer cockpits, Bloomberg terminals, and OpenAI developer tools.

```text
[PRIMARY FOCAL POINT (Weight: 100)]
  └─ Circular Readiness Score Ring (Glowing Accent + Monospace 78%)

[SECONDARY FOCAL POINT (Weight: 80)]
  ├─ Next Best Action Card (Border-glow + High Urgency Badge)
  └─ Candidate Persona Switcher Pills (Top Right Telemetry)

[TERTIARY FOCAL POINTS (Weight: 60)]
  ├─ 4 KPI Metrics Cards (Competency, Portfolio, Resume, Pipeline)
  └─ Interactive Mathematical Sliders (Batch Size, Base Salary, Cliff)

[BASE CONTENT (Weight: 40)]
  ├─ Data Tables, Milestone Checklists, Flashcard Banks, Code Blocks
```

---

## 2. Information Density & Visual Balance

| Design Dimension | Current Observation | UX Evaluation | Recommendation |
| :--- | :--- | :--- | :--- |
| **Visual Density** | High density with compact typography (11–13px labels) | **Target-Accurate**: Appeals strongly to senior systems engineers who prefer dense telemetry over empty whitespace. | Maintain density, but increase visual contrast on primary CTA buttons. |
| **Card Monotony** | Multiple adjacent rectangular cards use identical `1px solid var(--border)` | **Slight Repetition**: Pages can feel like uniform grids of gray boxes. | Introduce subtle elevation and primary/secondary card border tints (`--border-strong` for active items). |
| **Typography Stack** | Geometric Sans (`Plus Jakarta Sans`) + Code Monospace (`JetBrains Mono`) | **Outstanding**: Clean legibility, distinct code metrics, authentic developer vibe. | Preserve current typography rules globally. |
| **Color Semantics** | Restrained green (verified), blue (systems), amber (warning), red (deficit) | **Disciplined**: No garish gradients or decorative fluff. Colors strictly communicate state. | Ensure colored badges always have corresponding text labels for accessibility. |
| **Interactive Affordance**| Buttons and clickable cards have hover elevations (`translateY(-1px)`) | **Good**: Users quickly learn that cards and badges are interactive. | Add subtle chevron icons (`→`) to clickable cards to indicate navigation. |

---

## 3. Page-by-Page Visual Rhythm Analysis

1. **Dashboard (`/`)**:
   * *Strength*: Hero 50/50 split between Circular Score and Next Action anchors the view.
   * *Opportunity*: Increase vertical spacing between the 4-pillar cards and the bottom application table.
2. **Projects Showcase (`/projects`)**:
   * *Strength*: Hopper H100 GPU specs, milestone checkboxes, and tech badges are well structured.
   * *Opportunity*: Embed the interactive Triton latency bar visualizer directly inside the Triton FlashAttention card.
3. **ATS Checker (`/ats-checker`)**:
   * *Strength*: Side-by-side comparison of Resume Canvas vs JD Keyword Inspector is clear.
   * *Opportunity*: Highlight verified proof badges with a distinct blue highlight so candidates immediately spot injected evidence.
