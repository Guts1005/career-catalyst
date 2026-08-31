# 12. Edge Cases & Resilience Test Matrix

## 1. Edge Case Test Results

| Test ID | Scenario Description | Tested Condition | Expected Result | Actual Behavior Observed | Verdict |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | **No Active Target Jobs** | `jobs` list empty. | Pipeline toolbar hidden; standard presets displayed. | Clean preset buttons rendered. | **PASS** |
| **TC-02** | **One Target Job** | Anthropic in `applied` stage. | Toolbar renders Anthropic button; clicking auto-fills form. | Form fields populated instantly. | **PASS** |
| **TC-03** | **Multiple Target Jobs** | Anthropic, NVIDIA, Cohere in pipeline. | Toolbar displays all target buttons; clicking toggles context. | Seamless 1-click toggling between target applications. | **PASS** |
| **TC-04** | **Empty Portfolio Projects** | `projects` list empty. | Synthesis falls back to default high-impact ML architecture STAR bullet. | Formats valid STAR letter cleanly. | **PASS** |
| **TC-05** | **1-Click Metric Injection** | User clicks `+ Add Latency Metric`. | Appends verified metric bullet to letter text. | Appends clean paragraph. | **PASS** |
| **TC-06** | **Copy to Clipboard** | User clicks `Copy Letter` / `Copy Pitch`. | Copies text and displays green `✓ Copied` state. | Clipboard updated and toast displayed. | **PASS** |
| **TC-07** | **Direct Browser Refresh** | Refreshing `/cover-letter?company=Anthropic`. | Preserves company and role query parameters. | Re-mounts cleanly with Anthropic banner. | **PASS** |
