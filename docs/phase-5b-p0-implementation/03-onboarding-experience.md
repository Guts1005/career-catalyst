# 03. Lightweight Orientation & Onboarding Experience

## 1. Design & UX Rationale

Rather than interrupting new visitors with an invasive, blocking modal tour or complex third-party tooltip overlays, Catalyst OS features a **compact, native, integrated orientation banner** directly embedded within the executive dashboard.

```text
+---------------------------------------------------------------------------------------------------+
|  ● PUBLIC DEMONSTRATION MODE                                                           [DISMISS ×]|
|  Welcome to Catalyst OS — The Career Operating System                                             |
|  A connected engineering command center that replaces fragmented developer trackers with a       |
|  continuous, verified hiring pipeline.                                                            |
|                                                                                                   |
|  [01 KNOW STATUS]      [02 BUILD PROOF]      [03 LAND THE ROLE]     [04 INTERVIEW & CLOSE]        |
|  Evaluate 4-pillar     Verify Triton/CUDA    Match target JDs and   Master technical system       |
|  readiness score       GPU kernels and       inject verified proof  design flashcards & model     |
|  calibrated to labs.   certifications.       (+INJECT) to resume.   4-year equity packages.       |
|                                                                                                   |
|  [START WITH NEXT BEST ACTION →]  [CALIBRATE TARGET ROLE ⚙]    💡 Switch personas above to preview|
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Key Orientation Behaviors

1. **First-Time Discovery (30-Second Clarity)**:
   * Communicates what Catalyst OS is immediately upon initial render.
   * Clarifies that the platform operates in **Public Demonstration Mode** with preloaded benchmark candidate datasets.
2. **Action-Oriented Next Steps**:
   * **Primary CTA**: `START WITH NEXT BEST ACTION →` links directly to the active candidate's highest-urgency task (e.g. Anthropic interview prep).
   * **Secondary CTA**: `CALIBRATE TARGET ROLE ⚙` opens the goal calibration modal.
3. **Graceful Persistence & Re-Openability**:
   * Dismissing via `[DISMISS ×]` persists `localStorage.setItem('catalyst_orientation_dismissed', 'true')`.
   * The persona switcher banner includes a `🧭 GUIDE` button that triggers a custom event (`catalyst:reopen-orientation`) to restore the banner whenever desired.
4. **Zero Layout Shift & Full Responsiveness**:
   * Transitions smoothly from 4 columns on desktop to 2 columns on tablet and 1 stacked column on mobile viewports.
