# 12. Edge Cases & Resilience Test Matrix

## 1. Edge Case Test Results

| Test ID | Scenario Description | Tested Condition | Expected Result | Actual Behavior Observed | Verdict |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | **No Active Interviews** | All jobs in `wishlist` or `applied`. | No active interview toolbar; standard question bank rendered. | Clean standard question bank displayed. | **PASS** |
| **TC-02** | **One Active Interview** | 1 job in `interview` status (e.g. Anthropic). | Automatically calibrated for Anthropic; priority questions at top. | Banner and prioritized questions render cleanly. | **PASS** |
| **TC-03** | **Multiple Active Interviews** | Jobs at Anthropic (Interview) & NVIDIA (OA). | Toolbar displays both buttons; clicking either switches context instantly. | Seamless 1-click toggling between company sets. | **PASS** |
| **TC-04** | **Application Moved Out of Interview**| User drags Anthropic from `interview` to `offer`. | Anthropic removed from active interview toolbar; context resets. | Toolbar updates immediately. | **PASS** |
| **TC-05** | **Invalid Company Query** | URL `/interview-prep?company=unknown-co-123`. | Fails safely; standard question bank rendered without errors. | Clean fallback to standard repository. | **PASS** |
| **TC-06** | **Search Filter with Active Context** | User types "DPO" in search box while Anthropic is active. | Filters questions matching "DPO" while retaining company banner. | Accurately returns DPO question. | **PASS** |
| **TC-07** | **Direct Browser Refresh** | Refreshing `/interview-prep?company=Anthropic`. | Preserves company context and priority order. | Re-mounts cleanly with Anthropic priorities. | **PASS** |
