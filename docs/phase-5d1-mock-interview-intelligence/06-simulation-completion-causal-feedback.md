# 06. Simulation Completion & Causal Feedback Wiring

## 1. Connection B Integration

When a candidate completes a mock interview simulation, the result is credited directly to their career telemetry via `syncSolvedProblem`:

```typescript
// Sync Solved Problem / Assessment into Career State (Connection B)
syncSolvedProblem({
  problem_name: `${selectedCompany || selectedTrack} System Simulation`,
  topic: 'System Design',
  difficulty: 'Hard',
  status: 'Solved',
});
```

---

## 2. Structured Feedback Toast Payload

```text
┌────────────────────────────────────────────────────────┐
│ ✓ PROBLEM / SIMULATION VERIFIED                        │
│ Anthropic System Simulation (System Design • Hard)     │
│ ────────────────────────────────────────────────────── │
│ Pipeline & Readiness: 63% → 65% (+2%)                  │
│ Overall Readiness:    63% → 64% (+1%)                  │
│ ────────────────────────────────────────────────────── │
│ Next: Review interview notes in Job Tracker →          │
└────────────────────────────────────────────────────────┘
```
