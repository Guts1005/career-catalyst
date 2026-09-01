# 08. Routing & Query Parameter Matrix Audit

## 1. Global Route Query Parameter Inventory

| Route | Accepted Query Parameters | Connected Stream | Fallback Handling | Suspense Boundary? |
| :--- | :--- | :---: | :--- | :---: |
| `/project-generator` | `blueprintId`, `fromSkill` | **Connection A** | Falls back to default blueprint generator. | **YES** |
| `/interview-prep` | `company`, `role`, `stage`, `topic` | **Connection C** | Falls back to first active application or default bank. | **YES** |
| `/mock-interview` | `company`, `role`, `stage` | **Connection D** | Falls back to standard domain tracks. | **YES** |
| `/cover-letter` | `company`, `role`, `skills` | **Connection E** | Falls back to default role presets. | **YES** |
| `/resume-builder` | *None (Consumes Context)* | **Connection F** | Displays empty pending queue when none exist. | **YES** |
| `/resources` | `paper`, `arxiv`, `from` | **Connection G** | Displays full research archive with search. | **YES** |
| `/salary-insights` | `company`, `role`, `base`, `equity`, `bonus`, `stage` | **Connection H** | Falls back to standard market calculator. | **YES** |

---

## 2. Invariants Enforced

* **Suspense Guarding**: Every route reading `useSearchParams()` is wrapped in a `<Suspense>` boundary, ensuring clean static page generation during Next.js builds.
* **URL Encoding**: All company names, role strings, and search terms are sanitized with `encodeURIComponent()`.
