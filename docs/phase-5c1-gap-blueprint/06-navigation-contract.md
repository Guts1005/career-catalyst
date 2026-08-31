# 06. Navigation Contract & Deep-Link Parameter Specification

## 1. Explicit URL Contract

To avoid brittle hidden global state, Connection A uses an explicit, shareable, and refresh-safe URL query contract:

$$\mathbf{/project-generator?gap=\{gapSlug\}\&blueprint=\{blueprintSlug\}}$$

### Canonical Query Parameter Schema

| Parameter | Type | Required? | Example Value | Description |
| :--- | :--- | :---: | :--- | :--- |
| `gap` | `string` | Optional | `pytorch-cuda` | Normalized slug of the candidate's skill deficit. |
| `blueprint` | `string` | Optional | `triton-flash-attention` | Unique identifier of the recommended architecture blueprint. |

---

## 2. Parameter Validation Matrix

| Parameter State | Validation Routine | Behavior on Destination Page |
| :--- | :--- | :--- |
| **Valid `gap` & Valid `blueprint`** | Resolves `getBlueprintById(blueprint)` ➔ `Match` | Pre-selects domain tab, renders Contextual Gap Resolution Banner, highlights blueprint card with green border and recommendation badge. |
| **Valid `gap` with No `blueprint`** | Resolves `findBlueprintRecommendation(gap)` ➔ `Match` | Derives matching blueprint automatically and highlights it. |
| **Invalid `gap` / Invalid `blueprint`**| Validation returns `null` | Fails safely: renders standard Project Generator without banner or broken states; defaults domain to `all`. |
| **Direct Navigation (No Params)** | Search params empty | Standard Project Generator catalog with full domain filter tabs. |
