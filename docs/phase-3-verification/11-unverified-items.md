# 11. Unverified Items & Manual Testing Requirements

## 1. Overview

In adherence to the strict reporting rules of Phase 3, this document explicitly lists the items and subsystems that could not be fully verified programmatically and must be tested manually or in dedicated staging environments before production cutover.

---

## 2. Inventory of Unverified Items

| Item # | Feature / Area | Reason Not Verified in Automated Phase 3 | Required Manual Testing Procedure |
| :--- | :--- | :--- | :--- |
| **U-01** | **Physical Screen Reader Audio Output** | Automated DOM checking verifies `aria-` attributes, but cannot test physical voiceover pacing and pronunciation. | Test NVDA / VoiceOver / JAWS on macOS and Windows to verify table and slider reading. |
| **U-02** | **Direct Database DELETE Cascades** | Avoided executing `DELETE /api/projects/[id]` on production database to protect preloaded demo assets. | Test row deletion on staging Supabase instance and verify cascade deletion of `project_milestones`. |
| **U-03** | **Third-Party GitHub OAuth Handshake** | OAuth flow intentionally disabled during Public Demonstration Mode per user decision. | Test OAuth callback redirect URI once Supabase Auth keys and GitHub Developer App are provisioned. |
| **U-04** | **PDF Print Layout from Browser Native Print Dialog** | Browser print stylesheet rendering (`@media print`) requires real browser native print engine inspection. | Open `/resume-builder`, click "EXPORT PDF", and inspect generated print margins in Chrome and Firefox. |
| **U-05** | **Multi-Tenant Concurrent Writes** | Public demo mode uses shared dataset; concurrent editing collisions not simulated. | Simulate concurrent writes from multiple authenticated sessions in Phase 4. |
