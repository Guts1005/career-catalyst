# 12. Edge Cases & Resilience Test Matrix

## 1. Edge Case Test Results

| Test ID | Scenario Description | Tested Condition | Expected Result | Actual Behavior Observed | Verdict |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | **No Active Interviews** | All applications in `wishlist` or `applied`. | Toolbar hidden; 3 standard domain tracks rendered. | Clean default track selection displayed. | **PASS** |
| **TC-02** | **One Active Interview** | Anthropic in `interview` stage. | Context banner and FlashAttention questions loaded. | Clean Anthropic simulation screen rendered. | **PASS** |
| **TC-03** | **Multiple Active Interviews** | Anthropic & NVIDIA both in active interview stages. | Toolbar displays both buttons; clicking either swaps questions. | Seamless 1-click toggling between simulation sets. | **PASS** |
| **TC-04** | **Timer Expiry in Progress** | Countdown timer hits `00:00`. | Automated submission triggered without data loss. | Diagnostic scorecard produced immediately. | **PASS** |
| **TC-05** | **Benchmark Loader Click** | User clicks `⚡ Load Benchmark Sample`. | Injects company-tailored architectural response. | Benchmark text loaded instantly. | **PASS** |
| **TC-06** | **Invalid Company Query** | URL `/mock-interview?company=unknown-co-123`. | Fails safely; default questions loaded. | Clean fallback to standard simulation. | **PASS** |
| **TC-07** | **Direct Return Navigation** | User clicks `Return to Job Pipeline →` on scorecard. | Smooth router push back to `/job-tracker`. | Navigates back cleanly. | **PASS** |
