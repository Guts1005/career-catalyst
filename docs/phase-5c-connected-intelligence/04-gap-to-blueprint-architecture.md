# 04. Connection A: Skill Gap ➔ Actionable Blueprint Architecture

## 1. The Core Problem Solved

Currently, candidate competency deficits are identified in [`/analytics`](file:///E:/career-catalyst/src/app/analytics/page.js) and [`/skills`](file:///E:/career-catalyst/src/app/skills/page.js) as passive numbers (e.g. `Distributed Systems - Delta: 20%`), leaving candidates wondering: *"What exact engineering project do I need to build to close this gap?"*

Connection A bridges this gap by creating a **deterministic, 1-click bridge from identified deficits to architecture blueprints**.

```mermaid
graph TD
    A[Skill Gap Identified in /analytics: 'Distributed Systems - Delta: 20%'] --> B[System Evaluates GAP_BLUEPRINT_REGISTRY]
    B --> C[1-Click Action: 'BUILD DISTRIBUTED MoE BLUEPRINT →']
    C --> D[Navigates to /project-generator?skillGap=Distributed%20Systems]
    D --> E[User Reviews Specs, Tech Stack & Milestones]
    E --> F[Clicks 'IMPORT TO PORTFOLIO']
    F --> G[Project Added to /projects with Incomplete Milestones]
    G --> H[Candidate Completes Milestones ➔ Evidence Upgrades to PROJECT 0.85]
    H --> I[Gap Closes ➔ Readiness Score Recalculates (+11%)]
```

---

## 2. Deterministic Gap-to-Blueprint Registry

```typescript
export interface BlueprintMapping {
  skillPattern: string;
  blueprintDomain: string;
  blueprintName: string;
  expectedDeltaClose: number;
  description: string;
}

export const GAP_BLUEPRINT_REGISTRY: BlueprintMapping[] = [
  {
    skillPattern: 'Distributed Systems',
    blueprintDomain: 'mlops_engineering',
    blueprintName: 'Multi-Node Tensor Parallel Inference Engine from Scratch',
    expectedDeltaClose: 20,
    description: 'Implements Megatron-LM column/row parallel linear layers and 1F1B pipeline bubbles.',
  },
  {
    skillPattern: 'PyTorch & CUDA',
    blueprintDomain: 'mlops_engineering',
    blueprintName: 'Triton FlashAttention-2 Online Softmax GPU Kernel Suite',
    expectedDeltaClose: 15,
    description: 'Custom SRAM block tiling for fused multi-head attention avoiding quadratic HBM memory.',
  },
  {
    skillPattern: 'RAG Architecture & Eval',
    blueprintDomain: 'llm_rag',
    blueprintName: 'Autonomous Multi-Agent RAG with Self-Correction & Graph Search',
    expectedDeltaClose: 25,
    description: 'Dual Neo4j + Qdrant indexing with RAGAS automated hallucination self-grading.',
  },
  {
    skillPattern: 'Kafka / Real-Time Streaming',
    blueprintDomain: 'mlops_engineering',
    blueprintName: 'Real-Time Clickstream Ingestion with Kafka and ClickHouse',
    expectedDeltaClose: 20,
    description: 'Sub-second event stream processing with exactly-once delivery guarantees.',
  },
  {
    skillPattern: 'Computer Vision',
    blueprintDomain: 'computer_vision',
    blueprintName: 'Real-Time Edge Defect Detection with YOLOv10 & TensorRT',
    expectedDeltaClose: 20,
    description: 'Industrial surface anomaly detection at 65 FPS on edge NVIDIA Jetson hardware.',
  },
];
```

---

## 3. Implementation Data Flow

1. **Gap Detection**: `calculateCareerReadiness` outputs `gaps: [{ name, delta, ... }]`.
2. **Action Button in UI**: In `/analytics` and `/skills`, each gap row renders:
   ```jsx
   <Link
     href={`/project-generator?skillGap=${encodeURIComponent(gap.name)}`}
     className="btn btn-secondary btn-sm"
   >
     BUILD {mapping.blueprintName.slice(0, 24)}... →
   </Link>
   ```
3. **Contextual Blueprint Loading**: `/project-generator` reads `searchParams.get('skillGap')`, auto-selects the matching domain filter, and highlights the recommended blueprint card with a green border: `🎯 RECOMMENDED FOR YOUR DISTRIBUTED SYSTEMS GAP`.
4. **1-Click Import**: Clicking `IMPORT TO PORTFOLIO` adds the project to `CareerContext.projects`, automatically linking evidence tags to the matching skill.
