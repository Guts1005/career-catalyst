/**
 * @file gapBlueprintRegistry.ts
 * @description Centralized, deterministic registry mapping skill competency deficits
 * to actionable engineering blueprints in Catalyst OS.
 */

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

export const GAP_BLUEPRINT_REGISTRY: GapBlueprintMapping[] = [
  {
    gapId: 'pytorch-cuda',
    skillName: 'PyTorch & CUDA',
    blueprintId: 'triton-flash-attention',
    blueprintName: 'Triton FlashAttention-2 Online Softmax GPU Kernel Suite',
    domain: 'mlops_engineering',
    title: 'Custom GPU Kernel Acceleration Suite',
    whyItMatters: 'Top qualification for ML Systems Engineering, high-throughput LLM serving, and GPU kernel optimization roles.',
    reasonForRecommendation: 'Directly demonstrates custom GPU kernel fusion, SRAM block tiling, and HBM memory bandwidth minimization without quadratic materialization.',
    targetSkills: ['PyTorch & CUDA', 'PyTorch Internals & CUDA', 'Hardware Acceleration (H100/TPU)', 'Systems Performance'],
    evidenceImpact: ['↑ Engineering Proof', '↑ Core Competency (VERIFIED tier)'],
    expectedOutcome: 'Eliminates PyTorch/CUDA deficit and provides empirical Hopper H100 benchmark artifacts.',
    destination: '/project-generator?gap=pytorch-cuda&blueprint=triton-flash-attention',
  },
  {
    gapId: 'distributed-systems',
    skillName: 'Distributed Systems',
    blueprintId: 'distributed-tensor-parallel',
    blueprintName: 'Multi-Node Tensor Parallel Inference Engine from Scratch',
    domain: 'mlops_engineering',
    title: 'Multi-Node Model Parallelism Engine',
    whyItMatters: 'Essential evidence for scaling 70B+ parameter models across multi-node GPU clusters with high MFU (Model FLOPs Utilization).',
    reasonForRecommendation: 'Implements Megatron-LM tensor parallel linear layers, NCCL All-Reduce communication buffers, and 1F1B pipeline bubble scheduling.',
    targetSkills: ['Distributed Systems', 'Large-Scale Distributed Systems', 'ML Platform Design', 'Ray / Kubernetes Orchestration'],
    evidenceImpact: ['↑ Engineering Proof', '↑ Systems Scaling Evidence'],
    expectedOutcome: 'Validates multi-node throughput scaling and establishes Staff ML engineering proof.',
    destination: '/project-generator?gap=distributed-systems&blueprint=distributed-tensor-parallel',
  },
  {
    gapId: 'mlops-deployment',
    skillName: 'MLOps & Deployment',
    blueprintId: 'mlops-feast-airflow',
    blueprintName: 'Full-Lifecycle MLOps Platform with Feast Feature Store & Airflow',
    domain: 'mlops_engineering',
    title: 'Automated Continuous Retraining & Feature Platform',
    whyItMatters: 'Critical requirement for production model lifecycle governance, feature parity, and zero-downtime serving.',
    reasonForRecommendation: 'Builds end-to-end Feast feature storage, Airflow automated retraining DAGs, and Evidently AI drift detection.',
    targetSkills: ['MLOps & Deployment', 'Docker & Kubernetes', 'System Design'],
    evidenceImpact: ['↑ Engineering Proof', '↑ Production Deployment Proof'],
    expectedOutcome: 'Automates model release pipelines and guarantees point-in-time correct online feature retrieval.',
    destination: '/project-generator?gap=mlops-deployment&blueprint=mlops-feast-airflow',
  },
  {
    gapId: 'rag-architecture-eval',
    skillName: 'RAG Architecture & Eval',
    blueprintId: 'rag-graph-agent',
    blueprintName: 'Autonomous Multi-Agent RAG with Self-Correction & Graph Search',
    domain: 'llm_rag',
    title: 'Self-Correcting Multi-Agent Graph RAG',
    whyItMatters: 'Frontier AI labs require robust evaluation frameworks to eliminate hallucination in production agentic workflows.',
    reasonForRecommendation: 'Combines dual Neo4j knowledge graph indexing with Qdrant vector retrieval and automated RAGAS benchmark evaluation.',
    targetSkills: ['RAG Architecture & Eval', 'Vector Search (FAISS/Milvus)', 'Vector Search (FAISS)', 'LangChain & LlamaIndex'],
    evidenceImpact: ['↑ Engineering Proof', '↑ Application Accuracy Metrics'],
    expectedOutcome: 'Demonstrates end-to-end production RAG evaluation and 96.4% factual accuracy.',
    destination: '/project-generator?gap=rag-architecture-eval&blueprint=rag-graph-agent',
  },
  {
    gapId: 'vector-search',
    skillName: 'Vector Search (FAISS)',
    blueprintId: 'rag-graph-agent',
    blueprintName: 'Autonomous Multi-Agent RAG with Self-Correction & Graph Search',
    domain: 'llm_rag',
    title: 'Hybrid Dense Vector & Graph Indexing',
    whyItMatters: 'Core building block for retrieval-augmented generation and semantic search architectures.',
    reasonForRecommendation: 'Constructs hybrid dense vector + sparse BM25 indexing with semantic re-ranking and sub-150ms P95 latency.',
    targetSkills: ['Vector Search (FAISS)', 'Vector Search (FAISS/Milvus)', 'RAG Architecture & Eval'],
    evidenceImpact: ['↑ Engineering Proof', '↑ Retrieval Accuracy'],
    expectedOutcome: 'Provides verified vector search indexing and sub-150ms P95 latency benchmarks.',
    destination: '/project-generator?gap=vector-search&blueprint=rag-graph-agent',
  },
  {
    gapId: 'apache-spark-pyspark',
    skillName: 'Apache Spark & PySpark',
    blueprintId: 'lakehouse-iceberg-kafka',
    blueprintName: '10TB Streaming Data Lakehouse with Apache Iceberg, Kafka & ClickHouse',
    domain: 'mlops_engineering',
    title: 'Enterprise Streaming Lakehouse Architecture',
    whyItMatters: 'Key requirement for processing massive tabular and event streaming datasets in modern data lakehouses.',
    reasonForRecommendation: 'Builds high-throughput ETL pipelines with dbt transformations and Iceberg table optimization.',
    targetSkills: ['Apache Spark & PySpark', 'SQL & Query Optimization', 'Kafka / Real-Time Streaming'],
    evidenceImpact: ['↑ Engineering Proof', '↑ Data Systems Evidence'],
    expectedOutcome: 'Demonstrates 10TB batch transformation throughput and verified lakehouse ACID guarantees.',
    destination: '/project-generator?gap=apache-spark-pyspark&blueprint=lakehouse-iceberg-kafka',
  },
  {
    gapId: 'kafka-real-time-streaming',
    skillName: 'Kafka / Real-Time Streaming',
    blueprintId: 'lakehouse-iceberg-kafka',
    blueprintName: '10TB Streaming Data Lakehouse with Apache Iceberg, Kafka & ClickHouse',
    domain: 'mlops_engineering',
    title: 'Sub-Second Event Ingestion Pipeline',
    whyItMatters: 'Required for real-time feature streaming and low-latency event-driven microservices.',
    reasonForRecommendation: 'Integrates Kafka distributed messaging with ClickHouse real-time ingestion.',
    targetSkills: ['Kafka / Real-Time Streaming', 'SQL & Query Optimization', 'Airflow / Prefect Orchestration'],
    evidenceImpact: ['↑ Engineering Proof', '↑ Systems Reliability'],
    expectedOutcome: 'Proves sub-second ingestion latency with exactly-once delivery guarantees.',
    destination: '/project-generator?gap=kafka-real-time-streaming&blueprint=lakehouse-iceberg-kafka',
  },
  {
    gapId: 'sql-query-optimization',
    skillName: 'SQL & Query Optimization',
    blueprintId: 'lakehouse-iceberg-kafka',
    blueprintName: '10TB Streaming Data Lakehouse with Apache Iceberg, Kafka & ClickHouse',
    domain: 'mlops_engineering',
    title: 'High-Performance SQL & Columnar Engine',
    whyItMatters: 'Demonstrates ability to optimize query execution plans, partitioning schemes, and compute costs.',
    reasonForRecommendation: 'Implements partitioned table structures, columnar indexing, and dbt transformation models.',
    targetSkills: ['SQL & Query Optimization', 'dbt & Snowflake / BigQuery'],
    evidenceImpact: ['↑ Engineering Proof', '↑ Query Optimization Proof'],
    expectedOutcome: 'Validates query latency reduction from 12s to 450ms across 100M+ rows.',
    destination: '/project-generator?gap=sql-query-optimization&blueprint=lakehouse-iceberg-kafka',
  },
  {
    gapId: 'system-design',
    skillName: 'System Design',
    blueprintId: 'distributed-tensor-parallel',
    blueprintName: 'Multi-Node Tensor Parallel Inference Engine from Scratch',
    domain: 'mlops_engineering',
    title: 'High-Throughput Distributed System Design',
    whyItMatters: 'Central evaluation criterion in Staff & Principal engineering rounds across frontier AI labs.',
    reasonForRecommendation: 'Demonstrates continuous batching, memory hierarchy bandwidth analysis, and zero-downtime cluster orchestration.',
    targetSkills: ['System Design', 'Distributed Systems', 'ML Platform Design'],
    evidenceImpact: ['↑ Engineering Proof', '↑ Architecture Design Evidence'],
    expectedOutcome: 'Validates distributed system design invariants and establishes high-throughput serving proof.',
    destination: '/project-generator?gap=system-design&blueprint=distributed-tensor-parallel',
  },
  {
    gapId: 'computer-vision',
    skillName: 'Computer Vision',
    blueprintId: 'cv-edge-tensorrt',
    blueprintName: 'Real-Time Edge Defect Detection with YOLOv10 & TensorRT',
    domain: 'computer_vision',
    title: 'Real-Time Edge AI Vision Pipeline',
    whyItMatters: 'Critical for edge AI, automated defect inspection, and low-latency video inference pipelines.',
    reasonForRecommendation: 'Quantizes YOLOv10 to TensorRT INT8 precision and deploys multi-threaded video stream inference.',
    targetSkills: ['Computer Vision', 'PyTorch & CUDA', 'TensorRT & CUDA'],
    evidenceImpact: ['↑ Engineering Proof', '↑ Hardware Optimization'],
    expectedOutcome: 'Delivers 97.8% mAP@50 at 65 FPS real-time throughput on edge hardware.',
    destination: '/project-generator?gap=computer-vision&blueprint=cv-edge-tensorrt',
  },
];

/**
 * Normalizes a skill name or slug into a comparable token.
 */
function normalizeToken(token: string): string {
  return (token || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Finds a blueprint recommendation by matching a skill name or gap slug.
 */
export function findBlueprintRecommendation(query: string): GapBlueprintMapping | null {
  if (!query) return null;
  const clean = normalizeToken(query);

  // Exact match first
  for (const m of GAP_BLUEPRINT_REGISTRY) {
    if (normalizeToken(m.gapId) === clean || normalizeToken(m.skillName) === clean) {
      return m;
    }
    for (const ts of m.targetSkills) {
      if (normalizeToken(ts) === clean) {
        return m;
      }
    }
  }

  // Substring match
  for (const m of GAP_BLUEPRINT_REGISTRY) {
    const gapClean = normalizeToken(m.gapId);
    const skillClean = normalizeToken(m.skillName);
    if (clean.includes(gapClean) || gapClean.includes(clean) || clean.includes(skillClean) || skillClean.includes(clean)) {
      return m;
    }
  }

  return null;
}

/**
 * Retrieves a blueprint mapping by its blueprint ID.
 */
export function getBlueprintById(blueprintId: string): GapBlueprintMapping | null {
  if (!blueprintId) return null;
  const clean = normalizeToken(blueprintId);
  return GAP_BLUEPRINT_REGISTRY.find((m) => normalizeToken(m.blueprintId) === clean) || null;
}

/**
 * Retrieves all registered blueprint mappings.
 */
export function getAllRegistryMappings(): GapBlueprintMapping[] {
  return GAP_BLUEPRINT_REGISTRY;
}
