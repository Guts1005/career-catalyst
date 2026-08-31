# 09. State Management & Deep-Link Routing Contract

## 1. Unified Deep-Link Routing Specifications

To maintain zero hidden global state and guarantee browser refresh safety across all 5 new propagation streams, explicit URL contracts are standardized:

```text
[UNIFIED DEEP-LINK CONTRACT CATALOG]
  ├─ Connection D (Mock Interview):  /mock-interview?company={comp}&role={role}&track={track}
  ├─ Connection E (Pitch Studio):    /cover-letter?company={comp}&role={role}&skills={skills}
  ├─ Connection F (Resume Canvas):   /resume-builder?injectedSkill={skill}&fromProject={proj}
  ├─ Connection G (Research Citations): /resources?paper={paperSlug}&topic={topic}
  └─ Connection H (Offer Modeler):   /salary-insights?company={comp}&role={role}&base={base}&equity={eq}
```

---

## 2. Parameter Parsing & Fallback Rules

| Target Page | URL Parameters | Validation Routine | Fallback on Invalid / Empty Parameter |
| :--- | :--- | :--- | :--- |
| `/mock-interview` | `company`, `role`, `track` | `resolveCompanyContext(company)` | Defaults to `ml_system_design` standard track. |
| `/cover-letter` | `company`, `role`, `skills` | String sanitization & preset match | Defaults to first candidate preset (`Anthropic Staff AI`). |
| `/resume-builder` | `injectedSkill`, `fromProject` | `findProjectByName(fromProject)` | Displays standard candidate resume draft. |
| `/resources` | `paper`, `topic` | `findPaperBySlug(paper)` | Displays full research library with `all` filter active. |
| `/salary-insights`| `company`, `role`, `base`, `equity` | Numeric sanitization | Displays standard benchmark market percentiles. |
