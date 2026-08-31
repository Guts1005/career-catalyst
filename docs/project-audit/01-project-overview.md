# 01 — Project Overview: Catalyst OS

## 1. Executive Summary

**Catalyst OS** (Career Catalyst) is a dedicated Career Intelligence and Engineering Portfolio Operating System tailored for Machine Learning Engineers, AI Architects, and Data Systems Specialists.

The project is currently deployed in production at:
👉 **`https://ccsharvin.vercel.app/`**

The core thesis of Catalyst OS is **evidence-based career progression**: replacing self-reported claims on traditional resumes with a unified career graph that connects competency assessments, GitHub-verified codebases, benchmarked latency telemetry, ATS resume alignment, and active job pipeline velocity into a single reactive readiness score.

---

## 2. Core Project Telemetry

| Parameter | Project Specification |
| :--- | :--- |
| **Product Name** | Catalyst OS (Career Catalyst v2.6) |
| **Production URL** | `https://ccsharvin.vercel.app/` |
| **Framework** | Next.js 16.3.1 (App Router) |
| **React Version** | React 19.2.8 (`react`, `react-dom`) |
| **Language** | JavaScript (ESNext / JSX, `jsconfig.json` path aliasing) |
| **Bundler / Compiler** | Turbopack |
| **Database / Backend** | Supabase Cloud PostgreSQL (`@supabase/supabase-js` v2.112.3) |
| **Deployment Platform** | Vercel (Edge Network + Serverless Lambda Functions) |
| **State Architecture** | React 19 Context (`CareerProvider`) + `localStorage` Hydration + REST API |
| **Styling Architecture** | Native CSS Modules + Custom Semantic Tokens (`globals.css`) |
| **Total Frontend Pages** | 18 Routes |
| **Total API Endpoints** | 29 API Handlers (`src/app/api/`) |
| **Total Components** | 12 Global Components |

---

## 3. Technology Stack & Package Inventory

Analysis of `package.json` reveals an intentionally minimal dependency footprint:

```json
{
  "name": "career-catalyst",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.112.3",
    "next": "16.3.1",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "eslint": "^9",
    "eslint-config-next": "16.3.1"
  }
}
```

### Key Architectural Characteristics of Stack:
1. **Zero External CSS / Component Frameworks**: No Tailwind CSS, Radix, shadcn/ui, or Mantine. All UI components, buttons, inputs, tabs, and modals are hand-crafted with custom CSS and inline styles.
2. **Zero Animation Libraries**: No Framer Motion or GSAP. Animations rely on native CSS transitions and keyframes.
3. **Zero Third-Party Charting Packages**: No Chart.js or Recharts. Visualizations (Latency Visualizer, Equity Modeler, Progress Rings) are hand-built with CSS Flexbox/Grid and native SVG.
4. **Zero Type-Checker**: Entire project is written in vanilla JavaScript (`.js`), lacking TypeScript compilation guards.

---

## 4. Architectural Pillars & Core Value Proposition

1. **Canonical Career Graph (`src/lib/careerGraph.js`)**:
   - 6 structured tracks (Associate Data Scientist, Junior ML Engineer, Machine Learning Engineer, AI Application Engineer, Data Systems Engineer, Staff ML Systems Architect).
   - 4-Tier Evidence Hierarchy (`CLAIM` = 0.35, `ASSESSED` = 0.65, `PROJECT` = 0.85, `VERIFIED` = 1.00).
2. **Unified Career Readiness Telemetry**:
   $$\text{Readiness} = 0.30 \cdot S_{\text{skills}} + 0.30 \cdot P_{\text{portfolio}} + 0.20 \cdot R_{\text{resume}} + 0.20 \cdot V_{\text{pipeline}}$$
3. **Next Best Action Engine**:
   - Dynamically evaluates candidate deficits and outputs the single highest-ROI engineering move (`Score = (Impact \times Relevance \times Urgency) / Effort`).
4. **Closed Feedback Loops**:
   - Project proof updates skill evidence.
   - ATS keyword gap matcher cross-references project codebases.
   - Job rejection logger dynamically updates the Skill Gap Map.
   - Public showcase (`/portfolio/[username]`) directly projects internal verified records to recruiters.

---

## 5. Scope & Audit Objectives

This Phase 1 audit provides a complete, non-invasive discovery of the application across architecture, page routing, component boundaries, Supabase security, UX ergonomics, accessibility, performance, and code maintainability.
