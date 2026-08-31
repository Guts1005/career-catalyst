# 02. Pre-Release Verification Checklist

## 1. Quality & Safety Verification Checklist

| Verification Item | Requirement | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **No Secrets Tracked** | No `.env`, private keys, or credentials in git index | `git status --ignored` & code audit | **PASS** |
| **No Temp Debug Code** | No lingering `console.log` dumps, mock overrides, or test hacks | Code inspection across modified files | **PASS** |
| **Production Build** | `npm run build` compiles with 0 errors | Turbopack compilation | **PASS (1577ms)** |
| **ESLint Check** | `npm run lint` passes with 0 errors | ESLint core-web-vitals verification | **PASS (0 errors)** |
| **TypeScript Integrity** | Domain files compile without type errors | `tsc` / Next.js type check | **PASS** |
| **Runtime Bug Fixed** | `GET /api/projects` returns HTTP 200 with milestones | Local execution probe | **PASS** |
| **Fail-Safe DB Queries** | Endpoints fail fast (<2.5s) on database unreachable | Timeout wrapper testing | **PASS** |
| **Closed-Loop Workflow**| State sync propagation verified across all sub-apps | Domain workflow simulation | **PASS** |
| **WCAG Accessibility** | Skip-to-content, dark mode contrast $\ge 4.5:1$, ARIA sliders | Screen reader & DOM audit | **PASS** |
| **Responsive Geometry** | Zero horizontal overflow across 375px–1440px | Viewport stress testing | **PASS** |
