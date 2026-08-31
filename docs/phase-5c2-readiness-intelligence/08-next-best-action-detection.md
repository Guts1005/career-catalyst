# 08. Next Best Action Change Detection Specification

## 1. Action Transition Detection Logic

The delta engine evaluates whether a domain mutation triggered a shift in the candidate's prioritized next step:

```typescript
const prevAction = generateNextBestAction({
  targetRole: prevState.targetRole,
  skills: prevState.skills,
  projects: prevState.projects,
  jobs: prevState.jobs,
  readiness: prevReadiness,
  solvedProblems: prevState.assessments,
});

const nextAction = generateNextBestAction({
  targetRole: nextState.targetRole,
  skills: nextState.skills,
  projects: nextState.projects,
  jobs: nextState.jobs,
  readiness: nextReadiness,
  solvedProblems: nextState.assessments,
});

const nextBestActionChanged = prevAction?.title !== nextAction?.title;
```

---

## 2. Transition Scenarios & UI Presentation

| Scenario | State Transition | Previous Action Title | New Action Title | Toast Next Action UI |
| :--- | :--- | :--- | :--- | :--- |
| **First Project Completed** | Candidate had 0 projects; now has 1 completed project. | `Build Your First Core Project` | `Prepare Technical System Design` | Displays `[ VIEW NEXT ACTION → ]` linking directly to `/interview-prep`. |
| **Critical Gap Closed** | Algorithmic problem or ATS proof resolves $\ge 20\%$ gap. | `Bridge Skill Deficit: Master PyTorch` | `Expand Target Pipeline` | Displays `[ VIEW NEXT ACTION → ]` linking to `/job-tracker`. |
| **No Transition** | Action improves score but does not change the top priority recommendation. | `Prepare Technical System Design` | `Prepare Technical System Design` | Next Action footer is omitted from toast to minimize visual noise. |
