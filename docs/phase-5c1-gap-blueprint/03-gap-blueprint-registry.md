# 03. Gap Blueprint Registry Specification

## 1. Registry Architecture & Data Contract

The registry is centralized in [`src/lib/gapBlueprintRegistry.ts`](file:///E:/career-catalyst/src/lib/gapBlueprintRegistry.ts) and exposes deterministic mappings between skill deficits and engineering blueprints.

```typescript
export interface GapBlueprintMapping {
  gapId: string;
  skillName: string;
  blueprintId: string;
  blueprintName: string;
  domain: string;
  title: string;
  whyItMatters: string;
  reasonForRecommendation: string;
  targetSkills: string[];
  evidenceImpact: string[];
  expectedOutcome: string;
  destination: string;
}
```

---

## 2. Complete Mappings Catalog

| Gap ID | Target Skill | Recommended Blueprint | Domain | Expected Evidence Impact |
| :--- | :--- | :--- | :--- | :--- |
| `pytorch-cuda` | `PyTorch & CUDA` / `PyTorch Internals & CUDA` | Triton FlashAttention-2 Online Softmax GPU Kernel Suite | `mlops_engineering` | ↑ Engineering Proof, ↑ Core Competency (VERIFIED) |
| `distributed-systems` | `Distributed Systems` / `Large-Scale Distributed Systems` | Multi-Node Tensor Parallel Inference Engine from Scratch | `mlops_engineering` | ↑ Engineering Proof, ↑ Systems Scaling Evidence |
| `mlops-deployment` | `MLOps & Deployment` | Full-Lifecycle MLOps Platform with Feast Feature Store & Airflow | `mlops_engineering` | ↑ Engineering Proof, ↑ Production Deployment Proof |
| `rag-architecture-eval` | `RAG Architecture & Eval` | Autonomous Multi-Agent RAG with Self-Correction & Graph Search | `llm_rag` | ↑ Engineering Proof, ↑ Application Accuracy Metrics |
| `vector-search` | `Vector Search (FAISS)` / `Vector Search (FAISS/Milvus)` | Autonomous Multi-Agent RAG with Self-Correction & Graph Search | `llm_rag` | ↑ Engineering Proof, ↑ Retrieval Accuracy |
| `apache-spark-pyspark` | `Apache Spark & PySpark` | 10TB Streaming Data Lakehouse with Apache Iceberg, Kafka & ClickHouse | `mlops_engineering` | ↑ Engineering Proof, ↑ Data Systems Evidence |
| `kafka-real-time-streaming` | `Kafka / Real-Time Streaming` | 10TB Streaming Data Lakehouse with Apache Iceberg, Kafka & ClickHouse | `mlops_engineering` | ↑ Engineering Proof, ↑ Systems Reliability |
| `sql-query-optimization` | `SQL & Query Optimization` | 10TB Streaming Data Lakehouse with Apache Iceberg, Kafka & ClickHouse | `mlops_engineering` | ↑ Engineering Proof, ↑ Query Optimization Proof |
| `system-design` | `System Design` | Multi-Node Tensor Parallel Inference Engine from Scratch | `mlops_engineering` | ↑ Engineering Proof, ↑ Architecture Design Evidence |
| `computer-vision` | `Computer Vision` | Real-Time Edge Defect Detection with YOLOv10 & TensorRT | `computer_vision` | ↑ Engineering Proof, ↑ Hardware Optimization |

---

## 3. Query API & Matching Rules

* **`findBlueprintRecommendation(query: string)`**:
  1. Exact token match against `gapId` or `skillName`.
  2. Exact token match against any entry in `targetSkills`.
  3. Substring matching for composite skill names.
  4. Returns `null` if no match is found.
* **`getBlueprintById(blueprintId: string)`**:
  * Looks up mappings by normalized `blueprintId`.
