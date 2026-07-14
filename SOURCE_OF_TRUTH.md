# SOURCE OF TRUTH
### Multi-Client Data Aggregation & Display Platform
**Maintained by:** Project Manager Agent (Agent 2)
**Last Updated:** 2026-07-13
**Status:** Pre-Kickoff

---

> ⚠️ Every agent reads this document before doing anything else in a session.
> No agent acts on assumptions. If something conflicts with this document, stop and return to the PM Agent.

---

## 1. Project Overview

A multi-client web platform that aggregates, organizes, and displays data for multiple clients through a single hosted system. All clients share one data pipeline and one dashboard, which renders dynamically based on each client's engagement data. The platform is built once and reused across every client, not extended or rebuilt per client.

**First client:** LIFT The Tri-State (workforce development program, operated through FreeStore Food Bank, Cincinnati OH)

This is not a LIFT-specific application. LIFT is a client of the platform. The platform is the product.

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
| Local Dev | VS Code + Claude Code CLI (approval mode) | Where code is written and reviewed |
| Version Control | GitHub | Bridge between local and server, source of truth for all agents |
| Server | AWS Lightsail (Windows Server 2022) | Hosts everything, publicly accessible, $22/month flat rate, Ohio us-east-2a |
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

### Reserved Slots
- **Agent 10+** — roster can be extended. No new agent is added without PM approval and a defined role, scope, and handoff point documented here.

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

---

## 6. Claude Code Rules

- Claude Code runs in VS Code terminal, approval mode only
- Nothing writes to files without explicit developer approval
- Developer reviews every proposed change before it is written
- Claude Code is the execution environment for all builder agents

---

## 7. GitHub Repository Structure

```
/
├── SOURCE_OF_TRUTH.md        ← This document
├── README.md                 ← Project overview
├── /docs
│   ├── BA-UX-SPEC.md         ← BA/UX Agent output
│   ├── PHASE-1-COMPLETE.md   ← Documentation Agent output
│   ├── PHASE-2-COMPLETE.md
│   └── PHASE-3-COMPLETE.md
├── /phase-1                  ← Phase 1 code
├── /phase-2                  ← Phase 2 code
└── /phase-3                  ← Phase 3 code
```

---

## 8. GitHub URL Standards

Always use `raw.githubusercontent.com` URLs when referencing GitHub files in agent prompts. The blob URL format (`github.com/user/repo/blob/main/file`) returns 404 for Claude's fetch tool. The correct format is:

```
https://raw.githubusercontent.com/MajorDigi/multi-client-platform/main/FILENAME.md
```

Example: `SOURCE_OF_TRUTH.md` is accessed at `https://raw.githubusercontent.com/MajorDigi/multi-client-platform/main/SOURCE_OF_TRUTH.md`

---

## 9. Phase Definitions

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

## 10. Handoff Protocol

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

## 11. Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-07 | Windows VPS chosen over local hosting | Shareable links required from day one |
| 2026-07-07 | MySQL on VPS, not Azure Database | No additional cost or complexity needed at this scale |
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

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | BA/UX spec — V1 feature set | BA/UX Agent | ✅ Closed — BA-UX-SPEC.md and ARCHITECTURE-BRIEF.md committed to GitHub |

---

## 13. Phase Status

| Phase | Status |
|-------|--------|
| Pre-Kickoff Documentation | ✅ Complete |
| Environment Setup (Kickoff) | 🟡 In Progress |
| BA/UX Spec | ✅ Complete |
| Phase 1 — Static Hosting | ⬜ Not Started |
| Phase 2 — API + Reverse Proxy | ⬜ Not Started |
| Phase 3 — Auth + TLS + Public Link | ⬜ Not Started |
| Final Assembly | ⬜ Not Started |

---

*This document is the single source of truth for this project. All agents defer to it. All decisions are recorded in it. It lives in GitHub and is updated by the PM Agent after every significant decision or phase completion.*
