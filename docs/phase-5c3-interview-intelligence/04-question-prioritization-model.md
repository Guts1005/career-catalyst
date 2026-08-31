# 04. Question Prioritization Scoring Model Specification

## 1. Mathematical Scoring Formula

Questions are dynamically scored and prioritized at runtime without AI/LLM API calls or network latency:

$$\text{PriorityScore} = S_{\text{CompanyMatch}} + S_{\text{SkillGapMatch}} + S_{\text{Difficulty}}$$

Where:
* **$S_{\text{CompanyMatch}} = +30\text{ pts}$**: If the question category, question text, or answer matches any of the target company's primary focus topics (e.g. Online Softmax for Anthropic, CUDA Kernels for NVIDIA).
* **$S_{\text{SkillGapMatch}} = +20\text{ pts}$**: If the question category matches an active candidate competency deficit ($\text{Delta} > 0$).
* **$S_{\text{Difficulty}} = +10\text{ pts}$**: Bonus for `hard` difficulty questions during technical and architectural rounds.

---

## 2. Priority Classification & Badging

| Calculated Score Range | Classification | UI Treatment |
| :---: | :--- | :--- |
| $\ge 30\text{ pts}$ | **High Probability Priority** | Surfaced at top of question bank with `★ HIGH PROBABILITY FOR {COMPANY}` badge and purple left border (`4px solid var(--purple)`). |
| $10–29\text{ pts}$ | **Standard Alignment** | Standard display ordering below high-probability questions. |
| $0–9\text{ pts}$ | **General Practice** | Displayed in default repository order. |

---

## 3. Registered Company Profiles & Focus Topics

| Company Profile | Tier | Badge | Primary Focus Topics |
| :--- | :--- | :--- | :--- |
| **Anthropic** | Frontier AI Lab | `⚡ FRONTIER LAB` | `Distributed Systems`, `PyTorch & CUDA`, `Online Softmax`, `FlashAttention`, `RLHF & Alignment` |
| **NVIDIA** | Frontier AI Lab | `🟢 GPU SYSTEMS LEAD` | `GPU Kernel Optimization`, `Triton & CUDA`, `TensorRT-LLM`, `Inference Latency`, `SIMD Parallelism` |
| **OpenAI** | Frontier AI Lab | `🌐 FRONTIER LAB` | `Multi-Node Distributed Training`, `GQA & KV-Cache`, `Post-Training RL`, `Transformer Architectures` |
| **Cohere** | Tier-1 Tech | `🔮 ENTERPRISE RAG` | `RAG Architectures`, `Dense Vector Search`, `BM25 Fusion`, `Distributed PyTorch` |
| **Databricks** | Enterprise Infrastructure | `🧱 LAKEHOUSE PLATFORM` | `Apache Spark & PySpark`, `Lakehouse Architectures`, `Distributed Storage`, `ClickHouse / Iceberg` |
| **Meta** | Tier-1 Tech | `♾️ OPEN FOUNDATIONS` | `PyTorch Core`, `FSDP & DDP`, `Recommendation Systems`, `Large-Scale Distributed Systems` |
