# 07. Multiple Active Interview Handling Specification

## 1. Multiple Active Applications Strategy

Candidates frequently interview across multiple companies simultaneously (e.g. Anthropic, NVIDIA, and OpenAI).

```mermaid
graph TD
    A[Multiple Applications in Interview Stages] --> B[Job Tracker Board]
    A --> C[Interview Prep Page]
    
    B --> B1[Each card renders distinct 'PREPARE FOR {COMPANY}' CTA]
    C --> C1[Active Pipeline Switcher Bar]
    
    C1 --> D1[Click Anthropic -> Prioritizes Distributed Systems & FlashAttention]
    C1 --> D2[Click NVIDIA -> Prioritizes GPU Kernels & TensorRT]
    C1 --> D3[Click Clear Context -> Standard Question Bank View]
```

---

## 2. Deterministic Handling Invariants

1. **Zero Global Ambiguity**: URL search parameter `?company=...` takes definitive precedence over default ordering.
2. **One-Click Switcher**: The active interview toolbar displays all currently active pipelines with their specific stage names (`(INTERVIEW)`, `(OA)`, `(FINAL)`).
3. **No Mixed State**: When Anthropic is selected, NVIDIA questions are not falsely labeled as Anthropic priorities; only Anthropic-relevant questions receive the high-probability badge.
4. **Clean Context Clearing**: Clicking `Clear Context ✕` immediately resets the view to the standard complete question bank.
