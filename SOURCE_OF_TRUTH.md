# SOURCE OF TRUTH
### Multi-Client Data Aggregation & Display Platform
**Maintained by:** Project Manager Agent (Agent 2)
**Last Updated:** 2026-07-19
**Status:** In Development — Phase 1 Complete | Phase 2 Pending

---

> ⚠️ Every agent reads this document before doing anything else in a session.
> No agent acts on assumptions. If something conflicts with this document, stop and return to the PM Agent.

---

## 1. Project Overview

A multi-client web platform that aggregates, organizes, and displays engagement data for multiple clients through a single hosted system. The platform is built and operated by a consulting and facilitation practice co-owned by the developer and his business partner Ben. The practice runs structured engagements — workshops and sessions — for client organizations using the program Understanding Yourself: A Framework for Change. The platform exists to collect participant feedback from those engagements, aggregate and display the results, and give client organizations and stakeholders access to those results through a shared public dashboard. All clients share one data pipeline and one dashboard, which renders dynamically based on each client's engagement data. The platform is built once and reused across every client, not extended or rebuilt per client.

First client: LIFT The Tri-State — a workforce development program in Cincinnati, OH where an engagement was delivered. LIFT is a client organization of the consulting practice, not the owner or driver of the platform. The platform is the product.

---

## 2. Core Goals

- Build a reusable, multi-client data platform hosted on a real public server
- Learn and apply Windows IIS as a production web server and reverse proxy
- Establish a disciplined multi-agent AI development workflow
- Produce something real, shareable, and demonstrable at the end of every phase

---

## 3. Locked Technical Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Local Dev | VS Code + Claude Code CLI (approval mode), Node.js v24 LTS required | Where code is written and reviewed |
| Version Control | GitHub | Bridge between local and server, source of truth for all agents |
| Server | AWS Lightsail (Windows Server 2022) | Hosts everything, publicly accessible, $22/month flat rate, Ohio us-east-2a<br>**Note:** RDP access via mstsc — enter 18.220.214.171 directly, password from Lightsail console Connect tab. No .rdp file available. |
| Web Server | IIS + URL Rewrite + ARR | Front door, serves Angular app, reverse proxies to Node |
| API | Node.js + Express | Business logic, queries MySQL, never exposed directly |
| Database | MySQL | Data storage on AWS Lightsail VM, only Node talks to it |
| Frontend | Angular + TypeScript + Tailwind CSS | What the user sees, served as static files by IIS |

### How Components Talk To Each Other

```
User Browser
     ↓
IIS (front door — serves Angular, proxies /api/* to Node)
     ↓
Node.js + Express (logic layer — queries MySQL)
     ↓
MySQL (data layer — returns data to Node only)
```

- Nothing talks to MySQL except Node
- Nothing talks to Node except IIS
- All outside traffic goes through IIS first
- GitHub connects local dev to the VPS via push/pull

---

## 4. Agent Roster

| # | Agent | Job | Activation |
|---|-------|-----|------------|
| 0 | Kickoff | Environment setup, all tools installed and verified | First — before anything else |
| 1 | BA / UX | Business requirements, functional spec, UX design, version definitions → writes to GitHub | After Kickoff confirms environment ready |
| 2 | Project Manager | Source of truth, build plan, phase coordination, decisions log | After BA/UX doc is in GitHub |
| 3 | Phase 1 Builder | IIS static hosting, Angular build served via IIS | After PM issues spec |
| 4 | Phase 2 Builder | Node.js API + MySQL + IIS reverse proxy | After Phase 1 assembles clean |
| 5 | Phase 3 Builder | Auth, TLS, public shareable link | After Phase 2 assembles clean |
| 6 | Assembler | Progressive integration after each phase, confirms phases hold together | After each phase completes |
| 7 | QA / Testing | Connection tests, endpoint checks, auth flows, stakeholder link | After Assembler signs off per phase |
| 8 | Documentation | Produces phase artifacts, service docs, config references | After each phase, gates next phase |
| 9 | Code Review | Reviews written code post-approval, returns structured verdict, feeds back to builders | Phase 2 onwards, on demand |
| 10 | Consultation | Strategic thinking partner for PM. Handles questions too big or sensitive for the build layer. All outputs recorded locally in docs/STRATEGY-LOG.md only — never committed to GitHub. Activated on demand by PM only. | On demand — PM initiated only |

### Reserved Slots
- **Agent 11+** — roster can be extended. No new agent is added without PM approval and a defined role, scope, and handoff point documented here.

---

## 5. Agent Rules (Apply To All Agents)

1. Read this document before doing anything else in a session
2. Stay in your lane — do not perform another agent's job
3. No phase starts until the previous phase is documented by the Documentation Agent
4. The Documentation Agent gates every phase transition — this rule cannot be overridden
5. Code Review Agent cannot approve phase completion — only the Assembler can
6. The Assembler cannot sign off on a phase until QA has tested it
7. No agent re-litigates decisions already recorded in this document
8. If something is unclear or conflicts with this document, return to the PM Agent
9. No agent commits directly to GitHub. Agents produce documents and code in chat. The developer saves files locally in VS Code. Claude Code handles all commits and pushes to GitHub.
10. Agent 1 (BA/UX) scope boundary: BA/UX owns the application layer only — client data isolation, API query logic, display configuration, data upload flow, and application-level technical constraints. Infrastructure decisions — server, OS, IIS, networking, provisioning, hosting provider — belong to PM and Kickoff only. BA/UX does not cross into infrastructure territory.
11. Checkpoints must be issued as standalone singular instructions. A checkpoint is never embedded at the end of a multi-step instruction block. When a step requires developer confirmation before proceeding, that confirmation request is its own separate message — nothing else follows it until confirmation is received.
12. External accessibility and firewall verification must always use a dedicated open-port checking tool such as https://www.yougetsignal.com/tools/open-ports — never a mobile device browser. Enter the server IP and port number and confirm an unambiguous open or closed result. This applies to all agents performing any external reachability check in any phase.
13. File structure discipline — before any builder agent creates a single file, PM must confirm the repo and file structure is defined and locked in SOURCE_OF_TRUTH.md Section 9. Builder agents never create files outside the defined structure without explicit PM approval. File structure is established in planning, not discovered in building.
14. The header Status field, the Phase Status table, and the Last Updated date must always be updated together in the same commit. They are never updated separately. When a phase completes or a significant change is made PM updates all three in one Claude Code command.

---

## 6. Source of Truth Freshness Protocol

This protocol applies to every agent at the start of every session without exception.

**Step 1** — Read `SOURCE_OF_TRUTH.md` via the raw GitHub URL.
**Step 2** — Note the Last Updated date at the top of the document.
**Step 3** — Compare that date to today's date.
**Step 4** — Report one of two responses before doing any other work.

If more than 24 hours have passed since Last Updated, state:
> "SOURCE_OF_TRUTH.md read. Last Updated: [date]. More than 24 hours have passed. PM should paste the current source of truth contents directly into this chat before work proceeds."

If less than 24 hours have passed, state:
> "SOURCE_OF_TRUTH.md read. Last Updated: [date]. Within 24 hours — document appears current. If significant updates were made today consider pasting the latest version to be safe."

No agent proceeds with any work until this check is complete and reported. This rule cannot be overridden.

---

## 7. PM Radar

The PM Radar is a live working list maintained by the PM Agent. It captures items that are not done and not yet reflected in the Phase Status table — open loose ends, blockers, pending actions, and anything that needs attention before it falls through the cracks.

### Radar States
- 🔴 **Items on radar** — live list, actively maintained by PM
- ✅ **Radar clear** — all items resolved, explicitly declared by PM with date, section updated to reflect closure
- 📁 **Radar closed** — end of project, Documentation Agent captures full radar history in project completion report

### PM Responsibility
When the last radar item is resolved the PM Agent flags it explicitly in chat before updating this document. The radar is never silently emptied. Closure is always declared, dated, and recorded.

### Cleared Radar Format
When all items are resolved this section updates to:
"Status: ✅ Clear as of [date]. No open items. All previously tracked items resolved and documented."

The section is never deleted — cleared state is preserved as a record that items were tracked and intentionally closed, not abandoned.

### Current Radar Status
🔴 Items on radar as of 2026-07-18

| # | Item | Owner | Notes |
|---|------|-------|-------|
| 1 | ✅ COMPLETE — Kickoff fully done as of 2026-07-17. All tools installed, configured, and verified. PREFLIGHT-CHECKLIST.md committed to GitHub. | Agent 0 | |
| 2 | Kamatera $10 security deposit | Developer | Reclaim from Kamatera billing console before forgotten |
| 3 | Documentation Agent run | Agent 8 | Runs after Kickoff completes — documents full infrastructure journey from Azure through Kamatera to AWS Lightsail |
| 4 | Three infrastructure deviations | Agent 0 → Agent 8 | Azure abandonment, Kamatera abandonment, AWS Lightsail with Ohio region — held by Kickoff, captured by Documentation Agent when Kickoff closes |
| 5 | ✅ COMPLETE — Local machine already on v24.18.0, confirmed 2026-07-18. No upgrade needed. | Developer | |
| 6 | ✅ COMPLETE — Native RDC confirmed working as of 2026-07-18. Connect via mstsc using static IP 18.220.214.171 and password from Lightsail console Connect tab. No downloadable .rdp file available for this instance type. Clipboard confirmed working local to remote. | Developer | |
| 7 | CLAUDE.md public visibility — revisit when Web Lab methodology matures | PM | Currently public by design. When Web Lab grows into a productized methodology, evaluate moving CLAUDE.md behind .gitignore or a private repo. No action needed now. |
| 8 | [Routed to Tier 2 — Strategy Layer] | PM | This item was evaluated and deliberately moved to the private strategy layer. See STRATEGY-LOG.md locally. Not an omission. |
| 9 | [Routed to Tier 2 — Strategy Layer] | PM | This item was evaluated and deliberately moved to the private strategy layer. See STRATEGY-LOG.md locally. Not an omission. |
| 10 | Tier 2 document handling convention established — Agent 10 returns complete updated file not just new entry | PM | Developer replaces local file directly. No merge work. Applies to STRATEGY-LOG.md and WEBLAB-VISION.md. No build layer changes needed. |
| 11 | GitHub repo Website field — add public dashboard URL when Phase 3 completes | PM | Leave blank until Phase 3 TLS and public link are live. Then update GitHub repo About panel Website field with the confirmed public URL. |
| 12 | Prepare Web Lab transfer document for Do Art Studio PM | Agent 2 | On demand or at project close. PM produces a methodology and lessons-learned handoff document for the Do Art Studio project PM. Captures agent structure principles, two-tier architecture, governance patterns, and what worked and what needed correction. |
| 13 | README build timeline section — add at V1 completion | PM | Document the Web Lab efficiency story: commit history July 9 to completion, solo developer equivalent estimate 8-12 weeks full time, actual timeline built evenings and weekends around a full time 40-hour work week using multi-agent workflow. That context is not a caveat — it is a multiplier. Add after Phase 3 closes. Agent 8 captures build timeline in final completion report first. |
| 14 | README closing paragraph — add at V1 completion | PM | A closing paragraph that captures the full scope of how AI was leveraged in this project — not just code generation but project management, consulting, think tanking, brainstorming, logic amplification, and methodology design. Frame it for technical teams specifically: this project demonstrates that a single developer with the right AI workflow can produce what previously required a team. The efficiency story, the multi-role AI leverage, and the harness engineering methodology all land in this paragraph. Write it at V1 completion alongside the build timeline section. Include one to two sentences explicitly stating that the Web Lab methodology is living and evolutionary — not a finished system. Every phase taught something the previous phase did not anticipate. That is by design and a feature not a limitation. Maturity is shown through acknowledging evolution not claiming perfection. |
| 15 | Technical Architect Agent — add to Web Lab roster for future projects | PM | Current project has PM absorbing technical architecture decisions including repo structure and file organization. Future Web Lab projects should include a dedicated Technical Architect Agent that sits between BA/UX and builder agents. Owns repo structure, file organization conventions, layer separation rules, and builder compliance. Captured as a Web Lab methodology improvement not a current project action. |
| 17 | CI/CD automated deployment pipeline — future phase consideration | PM | Manual RDP deploy is intentional for V1 learning purposes. CI/CD is a legitimate next step after V1 ships. Evaluate as Phase 4 or a Web Lab methodology improvement for future projects. |
| 18 | CI/CD pipeline in Kickoff — Web Lab methodology improvement for future projects | PM | Manual RDP deploy in V1 provided intentional learning value but revealed a methodology gap. Future Web Lab projects should include CI/CD pipeline setup as a Kickoff deliverable — not a future phase addition. The deployment pipeline is infrastructure, not an afterthought. Kickoff Agent for future projects must include: repository connected to server, automated build trigger on push, deployment pipeline verified before Phase 1 Builder opens. This is a compounding return — every phase deploys cleanly from day one. |
| 19 | Phase 1 Documentation Agent run | Agent 8 | Documentation Agent must produce PHASE-1-COMPLETE.md before Phase 2 Builder opens. Must include: Angular scaffold and Tailwind setup, IIS site configuration, Default Web Site stop requirement, deployment process via RDP, external verification method, all three learning points from Agent 3. |

---

## 8. Claude Code Rules

- Claude Code runs in VS Code terminal, approval mode only
- Nothing writes to files without explicit developer approval
- Developer reviews every proposed change before it is written
- Claude Code is the execution environment for all builder agents

---

## 9. GitHub Repository Structure

The following structure is locked. No builder agent creates files outside this structure without PM approval.

```
/
├── SOURCE_OF_TRUTH.md
├── README.md
├── CLAUDE.md
├── .gitignore
├── /docs                    ← All documentation and phase artifacts
├── /client                  ← Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── environments/    ← required before Phase 2, added at Phase 1 close
│   ├── angular.json
│   ├── package.json
│   └── .postcssrc.json (Tailwind v4 PostCSS config)
├── /server                  ← Node.js + Express API (Phase 2)
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── db/
│   └── package.json
└── /deployment              ← IIS configuration and deployment scripts
    ├── iis-config/
    └── scripts/
```

Server deployment target: Angular build output from /client/dist is deployed to the IIS server. Node.js API runs from /server on the same server. IIS serves /client/dist as static files and reverse proxies /api/* to Node.

---

## 10. GitHub URL Standards

Always use `raw.githubusercontent.com` URLs when referencing GitHub files in agent prompts. The blob URL format (`github.com/user/repo/blob/main/file`) returns 404 for Claude's fetch tool. The correct format is:

```
https://raw.githubusercontent.com/MajorDigi/multi-client-platform/main/FILENAME.md
```

Example: `SOURCE_OF_TRUTH.md` is accessed at `https://raw.githubusercontent.com/MajorDigi/multi-client-platform/main/SOURCE_OF_TRUTH.md`

---

## 11. Phase Definitions

### Phase 1 — Static Hosting
**Builder:** Phase 1 Builder (Agent 3)
**Goal:** Angular app built and served as static files through IIS on the VPS
**IIS concepts learned:** App pools, site bindings, static file hosting, MIME types
**Done when:** Dashboard loads at a public URL served by IIS
**Hands off to:** Assembler → QA → Documentation

### Phase 2 — Live API + Reverse Proxy
**Builder:** Phase 2 Builder (Agent 4)
**Goal:** Node.js + Express API running on VPS, IIS reverse proxying /api/* to it, MySQL connected
**IIS concepts learned:** URL Rewrite, Application Request Routing (ARR), process management
**Done when:** Dashboard pulls live data from MySQL through the IIS reverse proxy
**Hands off to:** Assembler → QA → Documentation
**Note:** Code Review Agent activates this phase

### Phase 3 — Auth, TLS, Public Link
**Builder:** Phase 3 Builder (Agent 5)
**Goal:** HTTPS binding, admin authentication gate, public shareable stakeholder link
**IIS concepts learned:** SSL/TLS certificates, IIS security, access restrictions
**Done when:** Admin login works, public link is accessible without login
**Hands off to:** Assembler → QA → Documentation

---

## 12. Handoff Protocol

Every phase follows this exact sequence before the next phase begins:

```
Builder completes work
        ↓
Assembler confirms integration is clean
        ↓
QA tests and returns results
        ↓
Documentation Agent produces phase artifact → pushes to GitHub
        ↓
PM updates this document
        ↓
Next phase begins
```

No exceptions. No skipping steps.

---

## 13. Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-07 | Windows VPS chosen over local hosting | Shareable links required from day one |
| 2026-07-07 | MySQL on VPS, not Azure Database | MySQL Community Edition is fully free with no database size cap. SQL Server Express is free but caps at 10GB per database — a real constraint for a growing multi-client platform. SQL Server Standard/Enterprise carry licensing costs. Node.js mysql2 driver works equally well with MySQL. No technical advantage to SQL Server in a Node.js stack. |
| 2026-07-07 | Angular chosen over React | Consistency with lawn care app, existing knowledge |
| 2026-07-07 | Claude Code in approval mode only | Developer reviews every file write, no autonomous changes |
| 2026-07-07 | GitHub as persistent source of truth | Prevents context drift across agent sessions |
| 2026-07-07 | Documentation gates every phase | No phase starts until previous phase is fully documented |
| 2026-07-07 | Code Review Agent activates in Phase 2 | Phase 1 is config/static files, minimal code to review |
| 2026-07-07 | Azure VM chosen over AWS EC2 and Vultr | Developer already uses Azure at work, familiar with portal, 12-month free tier, Windows-native ecosystem for IIS |
| 2026-07-09 | GitHub MCP connector not used | No GitHub MCP connector exists in Claude connector directory. Claude Code serves as sole GitHub bridge, preserving approval-mode review on every commit. |
| 2026-07-09 | Raw URL standard established | blob URL format returns 404 for Claude fetch tool. All agent prompts must use raw.githubusercontent.com format. |
| 2026-07-12 | Flexible question-bank schema chosen | Questions and options stored as rows not fixed columns — avoids schema migrations as client response sheets evolve |
| 2026-07-12 | Data integrity approach locked | Application-level API enforcement for finalized records plus soft delete pattern — status column tracks active/finalized/archived, nothing hard deleted |
| 2026-07-12 | Two user types only — Admin shared credentials and public Viewer no login | Data is non-sensitive and operator-owned; avoids building client account infrastructure in V1 |
| 2026-07-12 | Export is public no auth required | Consistent with open Viewer model; no sensitive data at risk |
| 2026-07-12 | Rule-based auto-narrative for multiple choice questions, quote cards for open text | Avoids manual per-engagement writing and AI generation cost and risk |
| 2026-07-12 | Cross-engagement and cross-client aggregation in V1 | Minimal added query complexity, core to proof across industries value proposition |
| 2026-07-12 | QR code self-entry explicitly out of V1 | Avoids public write endpoints, abuse protection complexity, and second entry UX in V1 |
| 2026-07-12 | Client defined as contracting organization, attendees are anonymous respondents, no PII | No PII by design, sanitization enforced structurally at entry |
| 2026-07-12 | Azure abandoned, Kamatera abandoned, AWS Lightsail selected | Azure hit Free Trial quota restrictions, Kamatera Windows licensing added $19/month making total $58/month, Lightsail at $22/month flat with Windows included and no quota friction |
| 2026-07-12 | Ohio region selected over N. Virginia | Developer located in Cincinnati, Ohio is physically closer, lower latency, no functional downside |
| 2026-07-14 | Node.js v24 LTS chosen over v22 | v22 moved to Maintenance LTS in 2026, v24 is current Active LTS with support through April 2028. Server and local dev both standardized on v24 for consistency. |
| 2026-07-14 | Unplanned software left in place after Node.js install | Chocolatey, Python 3.14, VS 2026 Build Tools, and VC++ Redistributables installed automatically as side effect of Node.js v24 installer. No functional conflict with stack. Removal risk outweighs benefit. Logged as deviation for Documentation Agent. |
| 2026-07-19 | Repo and file structure locked before Phase 1 Builder starts | File structure definition is a PM responsibility that must be completed before any builder agent opens. Discovered as a gap when Phase 1 Builder was issued without a confirmed structure. Rule 13 added to prevent recurrence in this and future Web Lab projects. |
| 2026-07-19 | Manual RDP deployment intentional for V1 | CI/CD automation deliberately excluded from V1 scope. Manual deploy via RDP is how the developer learns IIS static hosting directly — one of the stated Core Goals. CI/CD added to roadmap as a future phase consideration, not a V1 item. |
| 2026-07-19 | Claude Code background task stop unreliable for process termination | ng serve and similar background processes may continue running after Claude Code TaskStop reports stopped. Always verify termination via netstat port check or tasklist process check. Never trust stopped status alone. |
| 2026-07-19 | IIS Default Web Site must be stopped before standing up a new port 80 site | Default Web Site occupies port 80 on fresh IIS install. Any new IIS site binding on port 80 requires Default Web Site to be explicitly stopped first. This applies to all future phases and all future Web Lab projects using IIS. |
| 2026-07-19 | Tailwind v4 selected — tailwind.config.js replaced by CSS/PostCSS configuration | Tailwind v4 eliminates tailwind.config.js in favor of CSS-based configuration via .postcssrc.json and @tailwindcss/postcss. This is an intentional framework version decision, not a deviation from intent. Section 9 repo structure updated to reflect v4 conventions. |
| 2026-07-19 | src/environments/ folder deferred to Phase 1 completion — added before Phase 2 | Angular environments folder required for Phase 2 API URL configuration. Absent from initial scaffold. Agent 3 directed to add it before Phase 1 signs off. |

---

## 14. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | BA/UX spec — V1 feature set | BA/UX Agent | ✅ Closed — BA-UX-SPEC.md and ARCHITECTURE-BRIEF.md committed to GitHub |

---

## 15. Phase Status

| Phase | Status |
|-------|--------|
| Pre-Kickoff Documentation | ✅ Complete |
| Environment Setup (Kickoff) | ✅ Complete |
| BA/UX Spec | ✅ Complete |
| Phase 1 — Static Hosting | ✅ Complete |
| Phase 2 — API + Reverse Proxy | ⬜ Not Started |
| Phase 3 — Auth + TLS + Public Link | ⬜ Not Started |
| Final Assembly | ⬜ Not Started |

---

*This document is the single source of truth for this project. All agents defer to it. All decisions are recorded in it. It lives in GitHub and is updated by the PM Agent after every significant decision or phase completion.*
