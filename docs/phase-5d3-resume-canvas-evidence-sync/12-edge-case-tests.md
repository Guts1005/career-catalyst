# 12. Edge Cases & Resilience Test Matrix

## 1. Edge Case Test Results

| Test ID | Scenario Description | Tested Condition | Expected Result | Actual Behavior Observed | Verdict |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | **No Injected Bullets** | Fresh session without ATS injections. | Evidence review card is completely hidden. | Normal resume editor displayed cleanly. | **PASS** |
| **TC-02** | **Single Keyword Injected** | Injected `FlashAttention` in ATS scanner. | Generates 1 pending card in Resume Canvas. | Card displayed with `✓ ACCEPT` button. | **PASS** |
| **TC-03** | **Duplicate Injection** | Injected `FlashAttention` twice in ATS scanner. | Deduplicates; only 1 entry created in queue. | Duplicate suppressed cleanly. | **PASS** |
| **TC-04** | **1-Click Acceptance** | User clicks `✓ ACCEPT & INSERT`. | Inserts into experience list; removes from pending. | Bullet added to form and paper preview. | **PASS** |
| **TC-05** | **1-Click Dismissal** | User clicks `✕` dismiss button. | Removes bullet from queue without inserting. | Card removed smoothly. | **PASS** |
| **TC-06** | **Custom Unknown Keyword** | Injected unknown term `Custom-Framework-9`. | Generates dynamic fallback template bullet. | Clean fallback formatted. | **PASS** |
| **TC-07** | **LaTeX / Markdown Export** | User copies LaTeX or Markdown after accept. | Export includes newly accepted bullet. | Verified exported text contains bullet. | **PASS** |
