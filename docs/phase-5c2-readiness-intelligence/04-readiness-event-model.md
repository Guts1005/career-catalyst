# 04. Structured Readiness Event Model Specification

## 1. Event Data Model

The structured readiness event is defined in [`src/lib/readinessDeltaEngine.ts`](file:///E:/career-catalyst/src/lib/readinessDeltaEngine.ts):

```typescript
export interface ReadinessStateDelta {
  id: string;
  timestamp: number;
  actionType: string;
  entityName: string;
  previousOverallScore: number;
  newOverallScore: number;
  overallDelta: number;
  affectedDimension: string;
  previousSubscore: number;
  newSubscore: number;
  subscoreDelta: number;
  reason: string;
  nextBestActionChanged: boolean;
  previousNextActionTitle?: string;
  newNextActionTitle?: string;
  newNextActionUrl?: string;
  isSignificant: boolean;
}
```

---

## 2. Field Descriptions & Contracts

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique event identifier (`feedback_${timestamp}`). |
| `timestamp` | `number` | Unix millisecond timestamp of action execution. |
| `actionType` | `string` | Human-readable action type (e.g. `CERTIFICATION_VERIFIED`, `ATS_PROOF_INJECTED`). |
| `entityName` | `string` | Name of the primary entity (e.g. `AWS Certified Machine Learning – Specialty`). |
| `previousOverallScore` | `number` | Unified overall readiness score before mutation. |
| `newOverallScore` | `number` | Unified overall readiness score after mutation. |
| `overallDelta` | `number` | Net overall score delta ($\pm\text{pts}$). |
| `affectedDimension` | `string` | Primary readiness dimension that absorbed the evidence (e.g. `Pipeline & Interview Readiness`). |
| `previousSubscore` | `number` | Subscore percentage of the affected dimension before mutation. |
| `newSubscore` | `number` | Subscore percentage of the affected dimension after mutation. |
| `subscoreDelta` | `number` | Net dimension subscore delta ($\pm\text{pts}$). |
| `reason` | `string` | Domain explanation of why this mutation impacted the career model. |
| `nextBestActionChanged`| `boolean` | `true` if the candidate's recommended next action transitioned. |
| `newNextActionTitle` | `string` | Title of the newly recommended next best action. |
| `newNextActionUrl` | `string` | Destination URL for the newly recommended next best action. |
| `isSignificant` | `boolean` | Flag indicating whether this event meets the display priority threshold. |
