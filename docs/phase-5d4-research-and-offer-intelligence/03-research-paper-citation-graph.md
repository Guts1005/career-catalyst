# 03. Research Paper Citation Graph & Taxonomy Specification

## 1. Domain Citation Map (Connection G)

| Interview Question Topic | Primary Peer-Reviewed Paper Citation | Authors & Institution | Key Theoretical Takeaway |
| :--- | :--- | :--- | :--- |
| **FlashAttention & Online Softmax** | *FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning* (arXiv:2307.08691) | Tri Dao (Stanford / Together AI, 2023) | Eliminates quadratic HBM I/O bottlenecks via online softmax tiling in on-chip SRAM. |
| **Megatron-LM Tensor Parallelism** | *Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism* (arXiv:1909.08053) | Mohammad Shoeybi et al. (NVIDIA Research, 2019) | Column-parallel and row-parallel GEMM splitting with minimal All-Reduce communication overhead. |
| **PagedAttention & KV-Cache Management** | *Efficient Memory Management for Large Language Model Serving with PagedAttention* (arXiv:2309.06180) | Woosuk Kwon et al. (UC Berkeley / LMSYS, 2023) | Partitions continuous KV-cache into virtual memory pages, reducing wasted fragmentation from 80% to < 4%. |
| **Direct Preference Optimization (DPO)** | *Direct Preference Optimization: Your Language Model is Secretly a Reward Model* (arXiv:2305.18290) | Rafael Rafailov et al. (Stanford University, 2023) | Closed-form implicit reward function to optimize preference objectives with binary cross-entropy loss. |
| **Triton GPU Kernel Programming** | *Triton: An Intermediate Language and Compiler for Tiled Neural Network Computations* (MAPL 2019) | Philippe Tillet et al. (Harvard / OpenAI, 2019) | Python-based programming model for high-performance GPU kernel engineering and bank conflict avoidance. |
| **Multi-Head Latent Attention (MLA)** | *DeepSeek-V3 Technical Report: Multi-Head Latent Attention & DeepSeekMoE* (arXiv:2412.19437) | DeepSeek-AI Team (2024) | Compresses KV cache into low-rank latent vectors to dramatically reduce inference memory footprint. |
