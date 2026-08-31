# 03. Company Simulation Rubrics & Question Sets

## 1. Company Simulation Catalog

| Company Profile | Simulation Title | Primary Evaluation Focus | Key Evaluation Rubric Keywords |
| :--- | :--- | :--- | :--- |
| **Anthropic** | Frontier Systems & FlashAttention-2 Screen | Online Softmax SRAM recurrence, Megatron-LM column/row linear split, NCCL All-Reduce bandwidth. | `flashattention`, `sram`, `hbm`, `online softmax`, `tiling`, `vllm`, `pagedattention`, `p99`, `nccl`, `all-reduce` |
| **NVIDIA** | Custom GPU Kernel & TensorRT Screen | Triton thread block tiling, shared memory bank conflict elimination, AWQ / FP8 quantization. | `triton`, `warp`, `shared memory`, `bank conflict`, `coalesced`, `fp16`, `tensor core`, `sram`, `latency` |
| **OpenAI** | Distributed Infrastructure & Alignment Screen | Grouped-Query Attention (GQA) KV-cache reduction, 1F1B bubble scheduling, Direct Preference Optimization (DPO). | `gqa`, `kv-cache`, `distributed`, `fsdp`, `zero-3`, `bandwidth`, `transformer`, `dpo`, `implicit reward` |
| **Databricks** | 10TB Streaming Lakehouse Screen | Delta Lake ACID transactions, Photon engine vector acceleration, Z-Ordering, liquid clustering. | `delta lake`, `spark`, `photon`, `acid`, `streaming`, `kafka`, `iceberg`, `partition pruning`, `z-order` |

---

## 2. Dynamic Benchmark Answers

The simulator provides high-depth architectural sample responses customized to each company's technology stack (e.g. FlashAttention-2 for Anthropic, Triton Kernels for NVIDIA, GQA/DPO for OpenAI) when clicking `⚡ Load Benchmark Sample`.
