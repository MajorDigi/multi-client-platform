# PM Session 01 — Decisions Log
### Founding Session, Multi-Client Data Aggregation & Display Platform
**Recorded by:** Project Manager Agent (Agent 2), transcribed by Documentation Agent (Agent 8)
**Session date:** 2026-07-07
**Status at time of session:** Pre-Kickoff

---

## 1. Project Definition

A multi-client web platform that aggregates, organizes, and displays data for multiple clients through a single hosted system. Each client gets its own data pipeline and display dashboard; the platform itself is built once and extended per client, rather than rebuilt per client.

**First client:** LIFT The Tri-State, a workforce development program operated through FreeStore Food Bank (Cincinnati, OH).

**Explicit framing decision:** This is not a LIFT-specific application that happens to be reusable — it is a platform product, and LIFT is its first client. This distinction governs architecture decisions throughout: nothing should be built in a way that only works for LIFT.

**Secondary goals recorded alongside the product goal:**
- Gain real, hands-on Windows IIS experience (recommended by the developer's employer)
- Establish a disciplined multi-agent AI development workflow as deliberate project-management practice
- Produce something real, shareable, and demonstrable at the end of every phase — not just at the end of the project

---

## 2. Agent Roster and Rationale

| # | Agent | Job | Rationale |
|---|-------|-----|-----------|
| 0 | Kickoff | Environment setup, all tools installed and verified | Nothing else can safely start until the environment is confirmed working — separating this from BA/UX prevents design work from starting on an unverified toolchain |
| 1 | BA/UX | Business requirements, functional spec, UX design, version definitions | Requirements and UX need to be locked before any architecture or build decisions are made downstream |
| 2 | Project Manager | Source of truth, build plan, phase coordination, decisions log | A dedicated owner for `SOURCE_OF_TRUTH.md` prevents drift — every agent defers to one authoritative document instead of reconstructing context each session |
| 3 | Phase 1 Builder | IIS static hosting, Angular build served via IIS | Isolated to the lowest-risk phase (static files only) so IIS fundamentals are learned before anything dynamic is introduced |
| 4 | Phase 2 Builder | Node.js API + MySQL + IIS reverse proxy | Separated from Phase 1 because reverse proxy + live data introduces real failure surface that shouldn't be mixed with static hosting setup |
| 5 | Phase 3 Builder | Auth, TLS, public shareable link | Security and public exposure deliberately held until the app already works end-to-end internally |
| 6 | Assembler | Progressive integration check after each phase | A dedicated integration gate, separate from the builder, so the person who built a phase isn't the only one confirming it's clean |
| 7 | QA / Testing | Connection tests, endpoint checks, auth flows, stakeholder link | Independent verification after assembly, before documentation locks the phase in |
| 8 | Documentation | Produces phase artifacts, service docs, config references; gates next phase | Documentation is made load-bearing on purpose — no phase can start until the previous one is written down, forcing discipline instead of allowing silent scope creep |
| 9 | Code Review | Reviews written code post-approval, structured verdict back to builders | Kept separate from Assembler/QA — code quality review is a different concern from "does it work," and this agent cannot itself approve phase completion (only the Assembler can) |

**Reserved slots:** Agent 10+ is available for future roles, but no agent is added without PM approval and a defined role, scope, and documented handoff point.

**Standing rules governing all agents (recorded, not open for re-litigation):**
1. Read `SOURCE_OF_TRUTH.md` before doing anything else in a session
2. Stay in your lane — no agent performs another agent's job
3. No phase starts until the previous phase is documented
4. Documentation gates every phase transition — cannot be overridden
5. Code Review cannot approve phase completion — only the Assembler can
6. The Assembler cannot sign off until QA has tested it
7. No agent re-litigates decisions already recorded in the source of truth
8. Ambiguity or conflict → return to the PM Agent
9. **No agent commits directly to GitHub.** Agents produce documents/code in chat; the developer saves files locally; Claude Code handles all commits and pushes.

---

## 3. Stack Decisions and Rationale

| Layer | Choice | Why |
|-------|--------|-----|
| Local Dev | VS Code + Claude Code CLI (approval mode) | Keeps a human review gate on every file write; no autonomous changes |
| Version Control | GitHub | Acts as the persistent bridge between local dev and the server, and as the single source of truth all agents read from — prevents context drift across sessions |
| Server | Azure Virtual Machine (Windows Server) | See Section 4 |
| Web Server | IIS + URL Rewrite + ARR | Front door for the platform; serves the Angular build as static files and reverse-proxies `/api/*` to Node. Chosen specifically because gaining production IIS experience was a stated project goal |
| API | Node.js + Express | Business logic layer; only component allowed to talk to MySQL directly |
| Database | MySQL, hosted on the Azure VM (not Azure Database) | No additional cost or managed-service complexity needed at this scale — a VM-hosted instance is sufficient for the platform's current size |
| Frontend | Angular + TypeScript + Tailwind CSS | Chosen over React for consistency with the developer's other active project (the lawn care app) and to build on existing Angular knowledge rather than splitting focus across frameworks |

**Traffic flow, as locked:**
```
User Browser → IIS (serves Angular, proxies /api/* to Node) → Node/Express → MySQL
```
- Nothing talks to MySQL except Node
- Nothing talks to Node except IIS
- All outside traffic goes through IIS first

---

## 4. Infrastructure Decision — Azure vs. AWS vs. Vultr

**Decision: Azure Virtual Machine (Windows Server), 12-month free tier.**

Rationale recorded:
- The developer already uses Azure at work, and one of the explicit goals of this whole project is to gain job-relevant Azure/IIS experience — using Azure here is direct, deliberate skill-building rather than an arbitrary infra choice
- Familiarity with the Azure portal reduces setup friction compared to learning AWS's console from scratch for this project
- Windows Server on Azure is a Windows-native path to IIS, whereas AWS/Vultr would have required either a Windows AMI (adding cost/complexity) or abandoning the IIS learning goal entirely for something like Nginx
- The free tier removes cost as a blocker for the first 12 months

AWS EC2 and Vultr were both considered and rejected on the same grounds: neither offered the direct "use what I use at work" learning value, and both would have added friction to the specific IIS goal that Azure/Windows Server serves natively.

**Shareable-link requirement:** A Windows VPS (rather than local-only hosting) was chosen because public, shareable dashboard links are a day-one requirement for at least one client (LIFT — stakeholder Katie needs a link, not a local demo).

---

## 5. Security Decisions

- Claude Code operates in **approval mode only** — every file write requires explicit developer approval; no autonomous changes to the codebase
- **No agent commits directly to GitHub** (Section 2, rule 9) — Claude Code is the sole write path to the repository, and the developer reviews every change before it lands
- The GitHub repository is **public**, but this is scoped deliberately: public applies to code and documentation only. Secrets (PAT, database credentials, Azure VM connection info) are excluded via `.gitignore` and are never to be committed, public repo or not
- Personal Access Token is fine-grained, scoped only to this repository, with Contents (read/write) and Metadata (read) — not a broad account-level token
- Auth and TLS (Phase 3) are deliberately sequenced *last* — the app is proven to work end-to-end internally before it's hardened and exposed publicly with login gates

---

## 6. GitHub Bridge Rule

**Decision confirmed by PM Agent.** A GitHub MCP connector was searched for in the Claude connector directory as a possible way to let chat agents commit directly to GitHub. **None was available.** Claude Code was confirmed as the sole GitHub bridge for this project.

This is treated as the correct outcome, not a temporary workaround: Claude Code's approval-mode workflow already enforces developer review before any commit, which aligns directly with the project's core principle of no autonomous file writes (Section 5). Even if a direct-write GitHub MCP connector becomes available in the future, the bridge rule stands — a connector that commits without developer review would undercut the control this project is built around.

The chain is always:
```
Agent produces content in chat
        ↓
Developer saves it to a local file (VS Code)
        ↓
Claude Code stages, commits, and pushes (approval mode, developer reviews each step)
```

---

## 7. Raw URL Standard

**Decision confirmed by PM Agent, recorded as a discovery + standing rule.** Across multiple agent sessions, fetching `SOURCE_OF_TRUTH.md` via the GitHub web/blob URL format —
```
https://github.com/<owner>/<repo>/blob/<branch>/<path>
```
— returned a 404 for Claude's fetch tool, repeatedly, even once the repository was public. Switching to the raw content URL format —
```
https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>
```
— resolved it, since this serves plain text with no GitHub UI wrapper.

**Standing rule:** Every future agent kickoff prompt — in this project and in any future project using the same multi-agent workflow — must reference repository documents using the raw URL form, never the blob URL form.

---

## 8. Pre-Kickoff Checklist Status (as of this session)

| Item | Status |
|------|--------|
| Environment Setup (Kickoff) | ⬜ Not Started |
| BA/UX Spec | ⬜ Not Started |
| Phase 1 — Static Hosting | ⬜ Not Started |
| Phase 2 — API + Reverse Proxy | ⬜ Not Started |
| Phase 3 — Auth + TLS + Public Link | ⬜ Not Started |
| Final Assembly | ⬜ Not Started |

## 9. Open Questions Carried Forward

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | BA/UX spec — V1 feature set | BA/UX Agent | Pending Kickoff |

## 10. Outstanding Correction — Not Yet Applied

**Document header discrepancy, confirmed by PM Agent:** `SOURCE_OF_TRUTH.md`'s header currently reads "Maintained by: Project Manager Agent (Agent 1)." This is incorrect. Per the confirmed roster (Section 2 above), Project Manager is **Agent 2**; BA/UX is Agent 1. This correction has **not yet been applied** to `SOURCE_OF_TRUTH.md` — flagging here so Claude Code fixes the header after these two docs are committed.
