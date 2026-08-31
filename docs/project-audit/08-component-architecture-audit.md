# 08 — Component Architecture Audit: Catalyst OS

An audit of the component library, hierarchy, reusability, modularity, and separation of concerns across Catalyst OS.

---

## 1. Global Component Inventory (`src/components/`)

| Component Name | File | Lines | Scope / Responsibility | Reusability |
| :--- | :--- | :---: | :--- | :--- |
| `BenchmarkLatencyVisualizer` | `BenchmarkLatencyVisualizer.js` | 144 | Interactive latency/throughput bar chart simulator with slider controls | **High** (Reused in `/` and `/projects`) |
| `CommandPalette` | `CommandPalette.js` | 205 | `Cmd+K` quick navigation overlay with keyboard navigation | **High** (Global Layout) |
| `CompensationEquityModeler` | `CompensationEquityModeler.js` | 150 | 4-year vesting and exit valuation growth simulator | **Medium** (Used in `/salary-insights`) |
| `Icons` | `Icons.js` | 207 | Custom zero-dependency geometric SVG icon set (30+ icons) | **High** (App-wide) |
| `LiveTelemetryTicker` | `LiveTelemetryTicker.js` | 278 | Rotating industry benchmark ticker with manual controls and citations | **Medium** (Used in `/`) |
| `MobileNav` | `MobileNav.js` | 238 | Fixed bottom mobile tab bar with sliding "More" destination sheet | **High** (Global Layout) |
| `OnboardingModal` | `OnboardingModal.js` | 270 | Multi-step candidate career calibration wizard | **High** (Global Layout) |
| `PageHeader` | `PageHeader.js` | 68 | Consistent page title, subtitle, and action button bar | **High** (Reused across 14 pages) |
| `ShareProfileButton` | `ShareProfileButton.js` | 34 | 1-click clipboard link generator for public recruiter portfolio | **Medium** (Used in `/portfolio/[username]`) |
| `Sidebar` | `Sidebar.js` | 294 | Sticky desktop navigation sidebar with readiness score and persona pill | **High** (Global Layout) |
| `ThemeToggle` | `ThemeToggle.js` | 90 | Dark/Light mode toggle button with sun/moon SVG transition | **High** (Used in Sidebar) |
| `Toast` | `Toast.js` | 76 | Global toast message container and `showToast` event dispatcher | **High** (App-wide) |

---

## 2. Component Architectural Strengths

1. **Clean Zero-Dependency Icon System (`Icons.js`)**:
   - Instead of pulling in large icon packages, `Icons.js` exports lightweight, pure SVG components with uniform 18x18 / 24x24 viewboxes and `stroke="currentColor"`.
2. **Modular Reusable Sub-Simulators**:
   - `BenchmarkLatencyVisualizer` is cleanly encapsulated, accepting parameters and maintaining its own slider state while emitting clean metrics.
3. **Decoupled Toast Event System**:
   - `showToast(message, type)` operates via a lightweight custom window event listener (`catalyst-toast`), enabling any client component or API helper to trigger notifications without prop-drilling context dispatchers.

---

## 3. Component Architecture Deficiencies & Anti-Patterns

### 3.1 Oversized Monolithic Pages
Several page files combine routing, layout, data fetching, business logic, state manipulation, and UI rendering into single 400–600 line files:
- `job-tracker/page.js` (616 lines): Manages drag-and-drop state, column mapping, modal form inputs, rejection reason parsing, and API synchronization in one file.
- `resume-builder/page.js` (483 lines): Houses work experience editor, education arrays, JSON schema validator, LaTeX previewer, and ATS scoring engine.
- `coding-tracker/page.js` (462 lines): Mixes LeetCode statistics calculations, category filtering, new problem modal state, and database mutation logic.

### 3.2 Missing UI Primitive Abstractions
The codebase lacks foundational atomic components for:
- `<Button>` (styled via recurring inline styles or `.btn` classes)
- `<Card>` (frequently re-declared with `var(--bg-surface)` and `var(--border)`)
- `<Badge>` / `<Tag>` (repeated with identical flex and font properties)
- `<Modal>` (each page re-implements overlay backdrop and focus mechanics)

### 3.3 Overuse of `'use client'`
16 of 18 pages are marked `'use client'`, preventing Next.js from performing optimal Server-Side Rendering (SSR), Static Site Generation (SSG), or streaming RSC chunks for heavy initial page loads.

---

## 4. Component Refactoring Opportunities (Future Phases)

1. **Extract Page Sub-Components**:
   - Refactor `job-tracker` into `<KanbanBoard>`, `<KanbanColumn>`, `<JobCard>`, and `<JobModal>`.
   - Refactor `resume-builder` into `<ResumeEditor>`, `<ResumePreview>`, and `<ResumeExportActions>`.
2. **Build a Shared UI Primitives Package**:
   - Implement `<Button>`, `<Input>`, `<Select>`, `<Modal>`, and `<Badge>` in `src/components/ui/`.
3. **Migrate Static Routes to Server Components**:
   - Convert pages that do not require continuous client-side user input into Server Components with nested client islands.
