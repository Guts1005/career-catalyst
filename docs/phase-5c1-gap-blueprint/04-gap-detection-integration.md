# 04. Gap Detection & Integration Engine

## 1. Mathematical Gap Derivation

Gaps are computed dynamically by `calculateCareerReadiness` in [`src/lib/careerGraph.ts`](file:///E:/career-catalyst/src/lib/careerGraph.ts):

$$\text{Delta} = \max(\text{TargetLevel} - \text{CurrentLevel}, 0)$$

Only skills where $\text{Delta} > 0$ are included in `readiness.gaps`, sorted in descending order of deficit magnitude.

---

## 2. Integration Points in UI

### 1. Career Analytics (`src/app/analytics/page.js`)
* Analyzes `readiness.gaps[0]` (the candidate's most severe deficit).
* If a mapping exists in `GAP_BLUEPRINT_REGISTRY`, renders a prominent, explainable `<GapBlueprintCard gap={topGap} />`.
* Displays a count link to `/skills` for all remaining secondary gaps.

### 2. Competency Radar & Skill Gap Map (`src/app/skills/page.js`)
* Iterates across all skills.
* For every skill with `gap > 0`:
  * Queries `findBlueprintRecommendation(s.name)`.
  * If found, renders an inline `[🚀 BLUEPRINT: ... →]` button linking to the deep-link contract.
* If `gap === 0` (skill target met), the blueprint CTA is suppressed to eliminate visual noise.

---

## 3. Zero Manufactured Gaps
No mock gaps are invented. If all skills meet or exceed target levels, `readiness.gaps` is empty, and the UI gracefully hides the gap recommendation container.
