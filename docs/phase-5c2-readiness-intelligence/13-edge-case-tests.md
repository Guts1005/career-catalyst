# 13. Edge Cases & Resilience Test Matrix

## 1. Edge Case Test Results

| Test ID | Scenario Description | Tested Condition | Expected Result | Actual Behavior Observed | Verdict |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | **Action Throws Error Before Update** | Network/API failure on `fetch('/api/certifications')`. | Error caught; no state change; no false delta event dispatched. | Error toast shown; domain state preserved. | **PASS** |
| **TC-02** | **Zero Score Delta Action** | Logging a duplicate paper already read in library. | Suppress structured feedback toast; show simple notice. | Small standard toast shown without score breakdown. | **PASS** |
| **TC-03** | **Rapid Fire Actions** | User triggers 4 certification completions in 1 second. | Queue capped at 2 toasts; newer replace older without clipping. | Smoothly renders latest 2 notifications. | **PASS** |
| **TC-04** | **Persona Switch with Active Toast** | User switches persona while feedback toast is visible. | Calibration toast takes precedence; no false score leap event. | Persona calibrated cleanly. | **PASS** |
| **TC-05** | **Immediate Route Navigation** | User completes action on `/ats-checker` and immediately clicks `/analytics`. | Global `ToastContainer` persists and completes countdown. | Toast renders seamlessly across route transition. | **PASS** |
| **TC-06** | **Keyboard Escape Dismiss** | Active feedback toast on screen; user presses `Escape`. | All active toasts dismissed immediately. | Toasts clear cleanly. | **PASS** |
| **TC-07** | **Next Action Unchanged** | Score increases but next recommended action remains the same. | Toast displays score deltas; omits next action footer. | Clean, non-redundant toast rendered. | **PASS** |
