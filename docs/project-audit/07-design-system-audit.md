# 07 — Design System Audit: Catalyst OS

An in-depth technical analysis of the visual architecture, typography, tokens, component consistency, and styling mechanisms across Catalyst OS.

---

## 1. Design System Tokens (`src/app/globals.css`)

The application defines a cohesive architectural design token system using CSS Custom Properties:

```css
:root, [data-theme="light"] {
  --bg: #fafafa;
  --bg-surface: #ffffff;
  --bg-subtle: #f4f4f5;
  --bg-inverse: #09090b;
  --border: #e4e4e7;
  --border-strong: #d4d4d8;
  --text-primary: #09090b;
  --text-secondary: #52525b;
  --text-muted: #71717a;
  --text-inverse: #ffffff;
  --accent: #09090b;
  --green: #16a34a;
  --amber: #d97706;
  --purple: #9333ea;
  --red: #dc2626;
  --sidebar-width: 240px;
}

[data-theme="dark"] {
  --bg: #09090b;
  --bg-surface: #121215;
  --bg-subtle: #18181b;
  --bg-inverse: #ffffff;
  --border: #27272a;
  --border-strong: #3f3f46;
  --text-primary: #f4f4f5;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --text-inverse: #09090b;
  --accent: #ffffff;
  --green: #22c55e;
  --amber: #f59e0b;
  --purple: #a855f7;
  --red: #ef4444;
}
```

---

## 2. Typography & Hierarchy

| Font Role | Font Family | Usage Across Application |
| :--- | :--- | :--- |
| **Display & Headings** | `Geist Sans`, `-apple-system`, `system-ui` | High-impact chapter titles (`01 — KNOW`, `02 — PROVE`), page headers, and card titles. |
| **Body & Paragraphs** | `Geist Sans`, `sans-serif` | Descriptions, interview questions, STAR points, and case study overviews. |
| **Telemetry & Code** | `Geist Mono`, `monospace` | Readiness percentages, latency numbers (`13.8ms`), hardware citations, and tags. |

### Tabular Number Alignment:
- CSS class `.tabular-num` enforces `font-variant-numeric: tabular-nums` to ensure jitter-free alignment during real-time number calculations.

---

## 3. Dark Mode & Zero-Flash Implementation

The dark mode implementation achieves zero Flash of Unstyled Theme (FOUT) through an inline execution snippet embedded directly in `src/app/layout.js`:

```html
<script dangerouslySetInnerHTML={{
  __html: `
    try {
      var saved = localStorage.getItem('catalyst-theme');
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = saved || (prefersDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
  `
}} />
```

- **Transition**: `globals.css` includes `body { transition: background 0.5s ease, color 0.5s ease; }` providing a smooth, cinematic 500ms theme shift when toggled.

---

## 4. Styling Architectural Inconsistencies

While the design tokens are well-architected, the codebase exhibits **heavy styling fragmentation**:

1. **Inline Style Proliferation**:
   - Many pages (`page.js`, `job-tracker/page.js`, `skills/page.js`) define hundreds of lines of inline styles (`style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'var(--bg-surface)' }}`) rather than utilizing reusable CSS utility classes or CSS module classes.
2. **Duplicated Component Structures**:
   - Badges, status tags, and buttons are re-implemented with slight differences in margin and padding across different page modules instead of utilizing unified primitive components.
3. **Card Elevation Inconsistencies**:
   - Some cards use `1px solid var(--border)` with zero shadow, while others mix `box-shadow: 0 4px 12px rgba(0,0,0,0.05)` with `border-strong`.

---

## 5. Design System Recommendations

1. **Consolidate Common Primitives**:
   - Extract recurring inline patterns into dedicated, reusable components: `<Button variant="...">`, `<Badge color="...">`, `<Card>`, `<MetricTile>`.
2. **Eliminate Redundant CSS Rules**:
   - Migrate repeated inline styles into their corresponding CSS modules (`page.module.css`).
3. **Harmonize Border Radius & Padding Scales**:
   - Standardize on a strict 4px/8px/12px border-radius scale and 8px grid spacing across all 18 pages.
