# 10. Query Parameter Safety & Fallback Verification

## 1. Query Parameter Matrix & Resilience Test

| Tested URL Pattern | Route | Context Resolution Outcome | Page Rendering Behavior | Error / Crash? |
| :--- | :--- | :--- | :--- | :---: |
| `/resources` | `/resources` | `paperParam = ''` | Displays full archive normally. | **NO (Clean)** |
| `/resources?paper=FlashAttention-2&arxiv=2307.08691` | `/resources` | Ingests paper & arxiv | Renders purple citation banner, filters search. | **NO (Clean)** |
| `/resources?paper=Unknown-Paper-XYZ` | `/resources` | Custom paper search | Safely renders banner without crashing. | **NO (Clean)** |
| `/salary-insights` | `/salary-insights` | `companyParam = ''` | Renders default market calculator. | **NO (Clean)** |
| `/salary-insights?company=Anthropic&base=235000&equity=180000` | `/salary-insights` | Ingests company & comp | Pre-fills sliders, form, and offer banner. | **NO (Clean)** |
| `/salary-insights?base=invalid_number` | `/salary-insights` | Malformed number string | Safely defaults to fallback values ($195k). | **NO (Clean)** |

---

## 2. Invariants Enforced
* **Safe Fallback**: Non-numeric or missing query parameters fallback gracefully to standard presets.
* **Suspense Boundary Safety**: Both `/resources` and `/salary-insights` wrap search param consumers in `<Suspense>`.
