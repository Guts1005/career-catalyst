# 07. Multiple Active Interview Handling Specification

## 1. Multiple Active Applications Strategy

```mermaid
graph TD
    A[Multiple Applications in Active Stages] --> B[Mock Interview Page]
    B --> C[Active Pipeline Simulation Switcher]
    C --> D1[Click Anthropic -> Ingests FlashAttention & Megatron Screen]
    C --> D2[Click NVIDIA -> Ingests Triton Kernels & TensorRT Screen]
    C --> D3[Click Standard Tracks -> Resets to General Domain Tracks]
```

---

## 2. Invariants Enforced

1. **Precedence**: `?company=...` URL search parameter determines current simulation track.
2. **Context Switching**: Clicking a different company in the toolbar updates the router and dynamically fetches the company's calibrated question set without a full page refresh.
3. **Clean Reset**: Clicking `Standard Tracks ✕` resets the view to the 3 default tracks (`ML System Design`, `Deep Learning Math`, `Behavioral & Leadership`).
