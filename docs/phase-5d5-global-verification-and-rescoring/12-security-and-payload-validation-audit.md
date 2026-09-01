# 12. Security & Payload Validation Audit

## 1. Security Whitelist & Sanitization Matrix

In [`src/lib/security.ts`](file:///E:/career-catalyst/src/lib/security.ts), all incoming API request payloads are rigorously filtered against the strict `ALLOWED_FIELDS` whitelist:

| Endpoint | Allowed Whitelist Fields | Security Enforcement |
| :--- | :--- | :--- |
| `/api/mock-interview` | `action`, `track`, `stage`, `rubric`, `response`, `company`, `role` | Strips unrecognized injection vectors; prevents mass-assignment. |
| `/api/cover-letter` | `company`, `role`, `candidate_skills`, `candidate_projects`, `skills`, `tone`, `job_description`, `notes` | Limits payload size; sanitizes HTML tags. |
| `/api/salary-insights` | `company`, `role`, `baseOffered`, `equityOffered`, `bonusOffered`, `targetComp`, `leverageReason` | Validates numeric inputs and allowed leverage enum values. |
| `/api/resume` | `title`, `full_name`, `email`, `phone`, `location`, `linkedin_url`, `github_url`, `portfolio_url`, `summary`, `template_name`, `education`, `experience` | Validates structured arrays and rejects prototype pollution. |

---

## 2. Parameter Sanitization & XSS Prevention

* **React Auto-Escaping**: All candidate-entered text (bullets, answers, scripts) is safely escaped by React DOM rendering.
* **URL Encoding**: Navigation query parameters are escaped with `encodeURIComponent()`.
* **No `eval` or Unsafe InnerHTML**: All rendering uses native React JSX components without dynamic HTML injection.
