# 13. Edge Cases & Safe Fallback Specifications

## 1. Multi-Stream Edge Case Matrix

| Edge Case Scenario | Tested Condition | Required Safe Fallback | Failure Prevention Mechanism |
| :--- | :--- | :--- | :--- |
| **Invalid Company Parameter** | `/mock-interview?company=unknown-co` | Falls back to standard track (`ml_system_design`). | `resolveCompanyContext` checks `isMatched: false`. |
| **No Verified Projects Available** | User triggers Pitch Studio with empty portfolio. | Uses default high-impact ML architecture STAR bullet. | Nullish coalescing in template generator. |
| **Duplicate ATS Proof Injections** | User clicks `+ INJECT` multiple times on same keyword. | Updates evidence idempotently without duplicating resume bullets. | Set-based bullet deduplication. |
| **Unregistered Research Paper Slug**| `/resources?paper=non-existent` | Opens full library with `all` filter active. | Safe lookup against `BENCHMARK_PAPERS`. |
| **Invalid Numeric Salary Query** | `/salary-insights?base=abc&equity=xyz` | Defaults to $195,000 base and $90,000 equity. | Number coercion `Number(base) || 195000`. |
