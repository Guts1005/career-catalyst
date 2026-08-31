# 08. UX Interaction Models & Non-Intrusive Intelligence Design

## 1. Non-Intrusive Intelligence Principles

Connected intelligence must feel like a **collaborative co-pilot, not a noisy pop-up machine**.

```text
[INTERACTION TIERS]
  ├─ TIER 1: Ambient Context (Inline badges, subtle color shifts, counter glide)
  ├─ TIER 2: Feedback Toasts (Lightweight 4-second notification for score milestones)
  ├─ TIER 3: Contextual Cards (Embedded next-step deep links inside existing cards)
  └─ TIER 4: Explicit User-Triggered Drawers (Project blueprint preview sheets)
```

---

## 2. Interaction Flow for the 3 Core Connections

### Connection A: Skill Gap ➔ Blueprint
```text
TRIGGER: User inspects Skill Gap table in /analytics.
SYSTEM RESPONSE: Matches gap name against GAP_BLUEPRINT_REGISTRY.
USER FEEDBACK: Renders a compact secondary button: [BUILD MoE BLUEPRINT →].
OPTIONAL ACTION: Clicking navigates to /project-generator?skillGap=Distributed%20Systems.
UPDATED CONTEXT: Blueprint is highlighted with matching tech stack; 1-click import into /projects.
```

### Connection B: Cause-and-Effect Readiness Feedback
```text
TRIGGER: User logs completed certification (AWS MLS-C01) or solves LeetCode/CUDA problem.
SYSTEM RESPONSE: Calculates previous vs. new readiness state; derives exact +5 point delta.
USER FEEDBACK: Displays sleek dark micro-toast in bottom-right corner:
               "✨ CREDENTIAL VERIFIED: +5% added to Pipeline Velocity (Readiness: 63% ➔ 64%)"
OPTIONAL ACTION: User can click [VIEW BREAKDOWN →] to jump to Analytics or ignore.
UPDATED CONTEXT: Header readiness score counter smoothly glides up by +1%.
```

### Connection C: Job Pipeline ➔ Interview Prep
```text
TRIGGER: User drags Anthropic application card from 'Applied' to 'Interview' column in /job-tracker.
SYSTEM RESPONSE: Detects company ('Anthropic') and extracts available question count (4 questions).
USER FEEDBACK: Inline badge expands inside the Anthropic job card:
               "🎯 4 Anthropic System Design Flashcards Ready"
OPTIONAL ACTION: User clicks [OPEN ANTHROPIC FLASHCARDS →] when ready to study.
UPDATED CONTEXT: Dashboard Next Best Action card automatically updates to prioritize Anthropic prep.
```

---

## 3. Noise Prevention Rules

1. **Zero Full-Screen Blocking Modals**: Stage transitions and score updates never interrupt user typing or drag-and-drop.
2. **Debounced Notification Cooldown**: Multiple rapid actions (e.g. checking off 3 milestones in 2 seconds) aggregate into a single unified summary toast:
   * *"✨ 3 Milestones Completed: +8% added to Portfolio Evidence Coverage"*
3. **Persistent Re-Access**: Contextual badges remain visible inside cards until the user completes the action or changes stages.
