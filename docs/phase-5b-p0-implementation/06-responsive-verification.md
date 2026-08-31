# 06. Responsive Design & Cross-Device Verification

## 1. Breakpoint Verification Matrix

| Viewport Width | Device Target | Orientation Banner Layout | Dashboard Pillars Layout | Navigation Shell Mode | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1440px** (Desktop) | Studio Display / Mac Pro | 4-column steps horizontal grid | 4-column cards horizontal grid | 240px persistent sticky sidebar | **PASS** |
| **1024px** (Laptop) | MacBook Air 13" / ThinkPad | 2x2 steps grid | 2x2 cards grid | 240px persistent sticky sidebar | **PASS** |
| **768px** (Tablet) | iPad Air / Surface Pro | 2x2 steps grid | 2x2 cards grid | Collapsed mobile bottom bar + sheet | **PASS** |
| **430px** (Large Mobile) | iPhone 15 Pro Max / Galaxy S24| 1-column stacked steps | 1-column stacked cards | Fixed bottom bar + slide-up drawer | **PASS** |
| **375px** (Small Mobile) | iPhone SE / Pixel 7 | 1-column stacked steps | 1-column stacked cards | Fixed bottom bar + slide-up drawer | **PASS** |

---

## 2. Component-Level Responsive Behaviors

### 1. Orientation Banner
* **Desktop ($\ge 1024\text{px}$)**:
  * Full-width container with 4 horizontal step cards and side-by-side CTA buttons.
* **Mobile ($\le 640\text{px}$)**:
  * Automatically stacks into a clean vertical list of 4 cards with 100% width primary CTA buttons (`START WITH NEXT BEST ACTION`).

### 2. Clickable 4-Pillar Grid
* **Desktop ($\ge 1024\text{px}$)**:
  * 4 equal columns (`repeat(4, 1fr)`) showing subscore progress bars and phase badges.
* **Tablet (768px – 1023px)**:
  * 2x2 grid (`repeat(2, 1fr)`) with preserved padding and legible typography.
* **Mobile ($\le 640\text{px}$)**:
  * Single-column vertical stack with full touch-friendly 48px+ hit targets.

### 3. Mobile Navigation Drawer (`MobileNav.js`)
* Slide-up bottom sheet renders all 4 phases (`01 COMMAND CENTER`, `02 BUILD PROOF`, `03 LAND THE ROLE`, `04 INTERVIEW & CLOSE`) with section headers, active indicators, and theme toggle.
