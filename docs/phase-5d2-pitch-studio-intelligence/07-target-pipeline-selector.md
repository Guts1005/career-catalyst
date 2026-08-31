# 07. Target Pipeline Selector & Context Management

## 1. Pipeline Selector Flow

```mermaid
graph TD
    A[Candidate Applications in Job Tracker] --> B[Pitch Studio Top Toolbar]
    B --> C1[Click Anthropic -> Auto-fills Anthropic role and requirements]
    B --> C2[Click NVIDIA -> Auto-fills NVIDIA GPU engineer requirements]
    B --> C3[Click OpenAI -> Auto-fills OpenAI ML infra requirements]
    B --> C4[Click Clear Context -> Resets to generic presets]
```

---

## 2. Invariants Enforced

1. **Precedence**: URL search parameters take priority on initial page mount.
2. **Context Switching**: Clicking a target application button updates form state and URL query parameters cleanly.
3. **Evidence Continuity**: Switching target companies preserves the candidate's active portfolio projects in `CareerContext`.
