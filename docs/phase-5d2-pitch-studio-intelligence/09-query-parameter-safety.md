# 09. Query Parameter Safety & Fallback Verification

## 1. Query Parameter Matrix & Resilience Test

| Tested URL Pattern | Context Resolution Outcome | Page Rendering Behavior | Error / Crash? |
| :--- | :--- | :--- | :---: |
| `/cover-letter` | `companyParam = ''` | Displays default form with preset options. | **NO (Clean)** |
| `/cover-letter?company=Anthropic` | `company = 'Anthropic'` | Renders Anthropic banner, auto-fills company field. | **NO (Clean)** |
| `/cover-letter?company=Anthropic&role=Staff%20AI&skills=CUDA` | All params present | Auto-fills all fields and attaches verified evidence. | **NO (Clean)** |
| `/cover-letter?company=unknown-xyz` | Custom company | Loads safely with custom company name. | **NO (Clean)** |
| `/cover-letter?company=Anthropic%20Lab` | Space-encoded string | Decodes properly without character corruption. | **NO (Clean)** |

---

## 2. Invariants Enforced
* **Safe Fallback**: Nullish query parameters fall back to default role presets cleanly.
* **URL Persistence**: Browser refresh retains the target company and role parameters.
