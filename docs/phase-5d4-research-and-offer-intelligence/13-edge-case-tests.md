# 13. Edge Cases & Resilience Test Matrix

## 1. Edge Case Test Results

| Test ID | Scenario Description | Tested Condition | Expected Result | Actual Behavior Observed | Verdict |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | **No Active Offers** | All applications in `applied` or `interview`. | Toolbar hidden; default calculator displayed. | Clean standard calculator rendered. | **PASS** |
| **TC-02** | **Single Offer Ingested** | Anthropic with `$235k` base, `$180k` equity. | Pre-fills form, sliders, and target delta. | Form & waterfall sliders hydrated instantly. | **PASS** |
| **TC-03** | **Multiple Offers Ingested** | Anthropic & NVIDIA in offer stages. | Toolbar shows both offer buttons; clicking swaps context. | Seamless 1-click toggling between offer scenarios. | **PASS** |
| **TC-04** | **Uncited Question** | Question without direct paper DOI. | Citation card hidden; standard answer rendered. | Clean answer rendering without errors. | **PASS** |
| **TC-05** | **Direct Paper Navigation** | Deep-link to `/resources?paper=FlashAttention-2`. | Banner rendered; search pre-filled; card highlighted. | Target paper isolated and highlighted cleanly. | **PASS** |
| **TC-06** | **Slider Dragging** | User drags equity grant to `$1.2M`. | Live chart and projected earnings update immediately. | 60 FPS real-time recalculation. | **PASS** |
| **TC-07** | **Copy Negotiation Script** | User clicks `COPY SCRIPT`. | Copies text with green `✓ COPIED` badge and toast. | Clipboard updated and toast displayed. | **PASS** |
