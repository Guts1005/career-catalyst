# 06. Connection C: Job Pipeline ➔ Interview Context Architecture

## 1. The Core Problem Solved

When candidates advance an application to the `interview` or `final` round in [`/job-tracker`](file:///E:/career-catalyst/src/app/job-tracker/page.js), the Kanban board operates in isolation. 

Candidates must manually remember to visit [`/interview-prep`](file:///E:/career-catalyst/src/app/interview-prep/page.js) and search for the specific company's system design questions.

Connection C bridges the **Application Stage Transition directly into Contextual Interview Preparation without disruptive screen redirects**.

```mermaid
graph TD
    A[Candidate drags Anthropic application to 'INTERVIEW' stage in /job-tracker] --> B[CareerContext dispatches APPLICATION_STAGE_CHANGED]
    B --> C[Set activeInterviewContext = { company: 'Anthropic', role: 'ML Systems Engineer' }]
    C --> D1[1. Job Card renders badge: '🎯 4 Anthropic Flashcards Ready →']
    C --> D2[2. Dashboard Next Best Action pivots to: 'Prepare Anthropic System Design']
    C --> D3[3. /interview-prep?company=Anthropic pre-filters relevant question bank]
```

---

## 2. Company-to-Question Taxonomy & Matching

[`src/app/interview-prep/page.js`](file:///E:/career-catalyst/src/app/interview-prep/page.js) already supports `searchParams.get('company')` query parameters.

### Company Mapping Matrix

| Company | Target Roles | Primary System Design Questions |
| :--- | :--- | :--- |
| **Anthropic** | ML Systems Engineer | FlashAttention-2 online softmax tiling, KV-cache quantization, NCCL communication buffers. |
| **OpenAI** | Applied AI Solutions Engineer | Multi-agent RAG with AST verification, DSPy prompt optimization, function calling latency. |
| **Databricks** | Lakehouse Solutions Engineer | Apache Iceberg ACID metadata, Spark structured streaming, ClickHouse sub-second ingest. |
| **NVIDIA** | CUDA Kernel Optimization Engineer | Hopper Tensor Core GEMM tiling, TMA asynchronous memory copies, warp divergence. |
| **Cohere** | Enterprise LLM Systems Lead | DPO reward optimization, Megatron 1F1B pipeline parallelism, Grouped-Query Attention. |

---

## 3. Non-Intrusive UX Design on the Kanban Board

When a candidate drags an application into the `Interview` or `Final Round` column:

```text
+-----------------------------------------------------------------------+
| Anthropic — ML Systems Engineer                       [96% MATCH]     |
| Stage: INTERVIEW (Round 2: System Design)                             |
|                                                                       |
| 🎯 ACTIVE INTERVIEW PREPARATION:                                      |
| 4 Company-Specific Questions & Flashcards Available                   |
| [OPEN ANTHROPIC FLASHCARDS →]  (Opens /interview-prep?company=Anthropic|
+-----------------------------------------------------------------------+
```

### Key UX Invariants Followed
1. **Zero Auto-Redirects**: The user stays on the Kanban board to finish organizing applications.
2. **Contextual Action Prompt**: The deep-link button is embedded directly inside the active job card.
3. **Omnipresent Dashboard Sync**: The executive dashboard immediately highlights the active interview round in its Next Best Action card.
