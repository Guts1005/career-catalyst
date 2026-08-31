# 14 — Improvement Opportunities: Catalyst OS

A strategic roadmap of architectural, design, performance, and engineering opportunities for the Catalyst OS platform.

---

## 1. Architectural Modernization Opportunities

### 1.1 Hybrid Server-Client Architecture (RSC Modernization)
- **Opportunity**: Currently, 16 out of 18 pages are marked `'use client'`. Transitioning data-heavy dashboard views to React Server Components (RSC) will:
  - Eliminate client-side data hydration waterfalls.
  - Enable instant initial HTML delivery with zero layout pop-in.
  - Shrink the client JavaScript bundle sent to mobile devices.

### 1.2 Unified State Synchronization Layer
- **Opportunity**: Connect all standalone sub-applications (`/certifications`, `/coding-tracker`, `/resources`, `/salary-insights`) into a single synchronized state pipeline via `CareerContext` or lightweight custom event hooks.
- **Benefit**: Any user activity (solving an algorithm, completing a paper, adding a certificate) immediately reflects in the live Readiness Score gauge in the sidebar.

---

## 2. Developer Experience & Quality Assurance

### 2.1 Incremental TypeScript Adoption
- **Opportunity**: Introduce TypeScript (`.ts` / `.tsx`) to type the core career graph domain models (`Track`, `Role`, `Competency`, `EvidenceTier`, `JobApplication`, `Project`).
- **Benefit**: Prevents fatal runtime `ReferenceError` bugs (like the `/api/projects` issue) at compile time.

### 2.2 Automated Unit & Integration Testing Suite
- **Opportunity**: Introduce Vitest to test mathematical weighting algorithms:
  - Verify `calculateCareerReadiness` across all 6 career tracks.
  - Verify `generateNextBestAction` priority formulas.
  - Verify input sanitization and XSS security filters in `security.js`.

---

## 3. UI/UX & Design System Refinements

### 3.1 Reusable UI Primitives Library
- **Opportunity**: Extract repeated inline styles into a lightweight primitive component library (`src/components/ui/`):
  - `<Button variant="primary|secondary|ghost" size="sm|md">`
  - `<Card elevated={true}>`
  - `<Badge color="green|amber|purple" variant="solid|outline">`
  - `<Modal isOpen={...} onClose={...}>` with built-in focus trap and Escape key listener.

### 3.2 Skeleton & Shimmer Hydration States
- **Opportunity**: Replace sudden loading state pops with smooth CSS shimmer skeletons matching the layout of Kanban columns, metric cards, and case studies.

### 3.3 Enhanced Mobile Ergonomics
- **Opportunity**: Implement responsive horizontal overflow scrolling and card collapsing for the algorithmic problem table (`/coding-tracker`) on viewports under 640px.

---

## 4. Backend, Security & Supabase Evolution

### 4.1 Declarative Database Migrations
- **Opportunity**: Create and commit local Supabase migration scripts (`supabase/migrations/`) capturing the 12 production tables and default seed data.
- **Benefit**: Enables 1-command reproducible local development and staging environments.

### 4.2 Multi-User Tenant Authentication (Future Scope)
- **Opportunity**: Integrate Supabase Auth (`@supabase/ssr`) with GitHub OAuth.
- **Benefit**: Allows real users to maintain private candidate pipelines and portfolio data separate from the shared public demo benchmarks.
