# Phase 1 Complete — Static Hosting
### Multi-Client Data Aggregation & Display Platform
**Owner:** Documentation Agent (Agent 8)
**Phase:** Phase 1 — Static Hosting
**Builder:** Phase 1 Builder (Agent 3)
**Status:** ✅ Complete
**Date:** 2026-07-19

---

## 1. Phase 1 Summary

Phase 1's goal, per `SOURCE_OF_TRUTH.md` Section 11, was to build the Angular application and serve it as static files through IIS on the AWS Lightsail VPS. Done criteria was defined as: **the dashboard loads at a public URL served by IIS.**

**Confirmed met.** The Angular app was scaffolded, built for production, deployed to the server, and is now served by a dedicated IIS site on port 80. Assembler confirmed clean integration, QA ran a 7-test verification pass (all passed — see Section 7), and this document formally closes out the phase per the Handoff Protocol.

What was delivered: a working Angular application shell, styled with Tailwind CSS v4, with routing wired to a placeholder dashboard component, deployed and reachable through IIS on the public server.

---

## 2. What Was Built

- **Angular project scaffolded** in `/client`, using **Tailwind CSS v4**
- **App shell** in place with a placeholder `DashboardComponent` and **routing wired** to it
- **`src/environments/` folder added**, with separate `dev` and `prod` configs — this was deferred from the initial scaffold and added before Phase 1 sign-off specifically so Phase 2's API URL configuration has a place to live (see Section 6, Deviations)
- **Production build verified** via `ng build` — confirmed the Angular app compiles cleanly to static output ready for deployment

---

## 3. Deployment Process

1. Production build output generated locally via `ng build`
2. Build output transferred to the server **via RDP clipboard** (native RDC client, per the Kickoff-phase clipboard fix — browser-based RDP does not support this)
3. Deployed to **`C:\inetpub\client`** on the AWS Lightsail Windows Server 2022 instance
4. A dedicated **IIS site named `client`** was created:
   - Its own **dedicated application pool** (not sharing the Default Web Site's pool)
   - **Port 80 binding**
5. **Default Web Site was stopped** to free port 80 for the new site

**This last step — stopping Default Web Site — is required, and must be performed explicitly in every future phase and every future Web Lab project that uses IIS.** It is not optional cleanup; without it, the new site cannot bind to port 80 at all. See Section 4.

---

## 4. IIS Configuration Notes

- **Default Web Site occupies port 80 by default** on any fresh IIS install
- **Stopping Default Web Site is a required prerequisite** before any new site can bind to port 80 — this is not a workaround, it's standard IIS behavior that has to be planned for
- This applies to **all future phases of this project**, and to **all future Web Lab projects that use IIS** — it's now a standing operational note, not a one-off Phase 1 quirk

---

## 5. Learning Points From This Phase

- **Claude Code's `TaskStop` on background processes is unreliable.** `ng serve` and similar long-running background processes may continue running even after Claude Code reports a "stopped" status. Termination must always be independently verified via `netstat` (port check) or `tasklist` (process check) — never trust the reported "stopped" status alone.
- **CI/CD pipeline gap identified.** Manual RDP deployment was intentional for V1 — it's how the developer learns IIS static hosting directly, which is one of the project's stated Core Goals. CI/CD has been added to the roadmap as a future consideration, not treated as a V1 requirement.
- **IIS Default Web Site port 80 conflict** is expected, standard behavior on a fresh install — now documented (Section 4) so it doesn't cost troubleshooting time again in Phase 2 or Phase 3.
- **Tailwind v4 configuration convention differs from earlier versions.** `tailwind.config.js` is not used — Tailwind v4 replaces it with CSS-based configuration via `.postcssrc.json` and the `@tailwindcss/postcss` plugin.
- **`/deployment` folder deferred to Phase 2.** No IIS configuration files were produced in Phase 1 that warranted permanent storage in the repo; the folder will be created in Phase 2 once reverse-proxy configuration actually produces files worth keeping.

---

## 6. Deviations From Original Plan

| Deviation | Detail |
|---|---|
| Tailwind v4 selected | `tailwind.config.js` is absent by design — replaced by CSS/PostCSS configuration (`.postcssrc.json`) per Tailwind v4 conventions. This is an intentional framework-version decision, not an unplanned deviation from intent. |
| `/deployment` folder absent | Deferred to Phase 2 per PM decision — no config files existed in Phase 1 to justify creating it yet. `SOURCE_OF_TRUTH.md` Section 9 is annotated accordingly. |

Both deviations are already reflected in the Decisions Log (`SOURCE_OF_TRUTH.md` Section 13, entries dated 2026-07-19) and required no additional PM escalation — they were anticipated and pre-approved as part of the locked repo structure.

---

## 7. QA Results Summary

**All 7 tests passed.**

QA ran under the **hybrid QA model** defined in `SOURCE_OF_TRUTH.md` Section 4 (Agent 7 role definition): Claude in Chrome was unavailable for this phase, so browser-dependent checks (visual rendering confirmation, console inspection) were walked through manually with the developer, who executed each check and confirmed the result directly — recorded as developer-verified.

Port/external-reachability verification used **`Test-NetConnection`** as the approved fallback (Rule 12), since `yougetsignal.com`'s result banner did not render during this QA pass — logged separately as a PM Radar item to investigate before Phase 2 introduces additional ports requiring verification.

Full detailed results are in `docs/PHASE-1-QA-REPORT.md`.

---

## 8. What Phase 2 Inherits

- **IIS running and serving the Angular app on port 80**, via the dedicated `client` site and app pool
- **`src/environments/`** already in place and ready for Phase 2 to populate with the API base URL
- **MySQL database `multi_client_platform`** and scoped application user **`platform_app`** already created and ready to connect to from the Node/Express API
- **Node.js v24.18.0** installed and confirmed on the server
- **`/deployment` folder** — not yet created; Phase 2 creates it once IIS reverse-proxy configuration files exist that are worth committing

Phase 2 Builder (Agent 4) can proceed directly into building the Node.js + Express API and wiring the IIS reverse proxy without any additional environment setup — the server-side foundation is fully in place.

---

*This document closes Phase 1 per the Handoff Protocol (`SOURCE_OF_TRUTH.md` Section 12). Per Rule 4, Phase 2 Builder does not open until this document is committed to GitHub.*
