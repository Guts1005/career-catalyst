# 03. STAR Evidence Injection Model Specification

## 1. Mathematical STAR Structure

The Pitch Studio constructs cover letters using a 4-tier STAR evidence hierarchy:

```text
[TIER 1: HOOK & REASONING]
  "Dear Hiring Team at {Company}, I am writing to express my strong enthusiasm for the {Role} position..."

[TIER 2: PRIMARY VERIFIED CASE STUDY (S.T.A.R.)]
  "Recently, I architected '{Project 1 Name}' utilizing {Tech Stack}, where I {Quantitative Impact}..."

[TIER 3: SECONDARY SYSTEMS EVIDENCE]
  "Additionally, I developed '{Project 2 Name}' ({Tech Stack}), successfully {Quantitative Impact}..."

[TIER 4: CREDENTIAL REINFORCEMENT & CLOSING]
  "To complement my systems engineering experience, I have earned industry-recognized credentials..."
```

---

## 2. Injected Evidence Snippet Catalog

| Snippet Type | Focus Area | Injected Evidence Content |
| :--- | :--- | :--- |
| **`+ Latency Metric`** | GPU & Serving Latency | *"In my previous architecture, I reduced inference latency by 45% while sustaining 4,800 req/sec across multi-node clusters with P99 < 15ms."* |
| **`+ Stack Evidence`** | Core ML Stack | *"My primary technical stack centers on PyTorch, custom Triton kernel optimization, FlashAttention, and high-throughput vLLM serving."* |
| **`+ RAG Metric`** | Vector & Retrieval | *"I architected a production multi-modal RAG cluster utilizing dense vector search, Reciprocal Rank Fusion (RRF), and cross-encoder re-ranking."* |
