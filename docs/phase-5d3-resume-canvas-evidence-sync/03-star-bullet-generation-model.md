# 03. STAR Bullet Generation Model Specification

## 1. Mathematical STAR Bullet Taxonomy

When an ATS missing technical keyword is injected, Connection F resolves the keyword against a specialized domain template dictionary in `CareerContext.js`:

| Target Keyword | Strong Action Verb | Technical Architecture Component | Quantitative Impact & Bound |
| :--- | :--- | :--- | :--- |
| **`FlashAttention`** | `Implemented` | FlashAttention-2 online softmax tiling with custom SRAM management | *reduced KV-cache memory demand by 45% on multi-GPU clusters* |
| **`Triton`** | `Architected` | Custom Triton GPU kernel pipelines for fused attention and MLP ops | *eliminated shared memory bank conflicts; P99 < 15ms* |
| **`CUDA`** | `Developed` | Custom CUDA kernels for attention mechanism optimization | *2.3× throughput improvement over baseline on H100s* |
| **`DeepSpeed`** | `Scaled` | Distributed model training with DeepSpeed ZeRO-3 optimizer | *reduced memory footprint by 8× with linear throughput* |
| **`vLLM`** | `Deployed` | Production vLLM serving with PagedAttention and continuous batching | *sustained 4,800 req/sec with P99 < 15ms* |
| **`RLHF`** | `Implemented` | End-to-end RLHF alignment pipeline with PPO optimization | *achieved 94% harmlessness benchmark scores* |
| **`DPO`** | `Designed` | Direct Preference Optimization pipeline without reward model | *reduced alignment compute by 60%* |
| **`FAISS`** | `Built` | Production vector similarity search with FAISS IVF-PQ indexing | *served 50M+ embeddings with sub-5ms query latency* |

---

## 2. Dynamic Fallback Formula

If an unrecognized custom keyword is injected, the generator dynamically formats:
```text
"Demonstrated proven competency in {Keyword} through verified work on '{ProjectName}', contributing to production system reliability and engineering velocity."
```
