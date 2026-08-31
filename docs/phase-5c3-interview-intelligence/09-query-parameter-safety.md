# 09. Query Parameter Safety & Fallback Verification

## 1. Query Parameter Matrix & Resilience Test

| Tested URL Pattern | Context Resolution Outcome | Page Rendering Behavior | Error / Crash? |
| :--- | :--- | :--- | :---: |
| `/interview-prep` | `isMatched = false` (Default mode) | Displays complete standard question bank with all category filters active. | **NO (Clean)** |
| `/interview-prep?company=Anthropic` | `isMatched = true` (Anthropic Profile) | Renders Anthropic Contextual Intelligence Banner and prioritizes FlashAttention/Distributed Systems. | **NO (Clean)** |
| `/interview-prep?company=NVIDIA` | `isMatched = true` (NVIDIA Profile) | Renders NVIDIA Contextual Banner and prioritizes GPU Kernel/CUDA questions. | **NO (Clean)** |
| `/interview-prep?company=invalid-company-xyz` | `isMatched = false` (Unknown Company) | Gracefully falls back to standard question bank; no broken banners or missing items. | **NO (Clean)** |
| `/interview-prep?company=Anthropic&role=Staff%20AI`| `isMatched = true` (With Custom Role) | Displays custom role in badge; prioritizes company questions correctly. | **NO (Clean)** |

---

## 2. Invariants Enforced
* **Safe Fallback**: Unrecognized company strings return `isMatched: false` and fall back to the standard repository without raising runtime exceptions.
* **URL Persistence**: Browser refresh on `/interview-prep?company=Anthropic` re-renders the exact calibrated questions.
