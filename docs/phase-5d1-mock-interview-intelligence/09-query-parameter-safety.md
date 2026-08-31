# 09. Query Parameter Safety & Fallback Verification

## 1. Query Parameter Matrix & Resilience Test

| Tested URL Pattern | Context Resolution Outcome | Page Rendering Behavior | Error / Crash? |
| :--- | :--- | :--- | :---: |
| `/mock-interview` | `selectedCompany = ''` | Displays 3 default tracks (`ML System Design`, etc.). | **NO (Clean)** |
| `/mock-interview?company=Anthropic` | `isMatched = true` (Anthropic Profile) | Renders Anthropic banner, loads FlashAttention/Megatron simulation questions. | **NO (Clean)** |
| `/mock-interview?company=NVIDIA` | `isMatched = true` (NVIDIA Profile) | Renders NVIDIA banner, loads Triton kernel/TensorRT questions. | **NO (Clean)** |
| `/mock-interview?company=unknown-xyz` | `isMatched = false` (Unknown Company) | Safely falls back to default questions with generic label. | **NO (Clean)** |
| `/mock-interview?company=Anthropic&role=Staff%20AI`| `isMatched = true` (With Custom Role) | Displays custom role in badge; questions loaded properly. | **NO (Clean)** |

---

## 2. Invariants Enforced
* **Safe Fallback**: Unrecognized company strings return standard question sets without crashing.
* **URL Persistence**: Refreshing `/mock-interview?company=Anthropic` retains company calibration.
