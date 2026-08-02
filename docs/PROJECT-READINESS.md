# Project Readiness Checklist
### Reusable Pre-Kickoff Template

**Purpose:** A standard checklist to run through before any Kickoff Agent (Agent 0) begins environment setup on this or a future project using the same multi-agent workflow. Items are grouped by category so partial readiness is visible at a glance instead of a single pass/fail gate.

Status below reflects this project (multi-client-platform) as of the Pre-Kickoff Documentation phase. Copy this file into a new project and reset all checkboxes to start a fresh readiness pass.

---

## 1. Local Environment

- [ ] VS Code installed
- [ ] VS Code GitHub extension installed and signed in
- [x] Claude Code CLI installed, authenticated, confirmed running in **approval mode**
- [ ] Node.js confirmed at project floor version (`node -v`)
- [x] `CLAUDE.md` initialized via `/init` and reviewed

## 2. Version Control

- [x] GitHub repository created
- [x] Repository visibility decision made and recorded (public, to support unauthenticated raw-URL agent access)
- [ ] Personal Access Token (PAT) generated, scoped to repo only, stored securely (not in repo)
- [x] Repository cloned locally
- [x] `.gitignore` in place covering secrets, dependencies, and build output
- [x] No secrets committed (verified before each commit)
- [x] GitHub bridge rule established — no agent commits directly to GitHub; Claude Code is the sole write path

## 3. Cloud Account

- [x] Cloud provider decided and rationale recorded (Azure Virtual Machine, Windows Server)
- [ ] Cloud account created / confirmed active
- [ ] Virtual machine provisioned
- [ ] Admin access to VM confirmed (RDP or equivalent)

## 4. Region Selection

- [ ] Target region chosen based on latency/proximity to primary users
- [ ] Region decision recorded in Decisions Log

## 5. Billing

- [ ] Free-tier / trial terms reviewed (e.g., 12-month free tier window and its limits)
- [ ] Billing alerts or budget caps configured
- [ ] Post-free-tier cost plan recorded

## 6. Pre-Agent Documentation

- [x] `README.md` created
- [x] `SOURCE_OF_TRUTH.md` created as the single authoritative project document
- [x] Agent roster defined with roles, jobs, and activation order
- [x] Agent Rules recorded (lane discipline, phase gating, no direct GitHub commits)
- [x] Locked technical stack recorded
- [x] Decisions Log started and kept current
- [x] Security directives documented (no secrets committed, check diffs before commit)
- [x] GitHub URL standard documented (`raw.githubusercontent.com`, not `blob/` URLs)
- [x] Environment Setup Guide written (`docs/ENVIRONMENT-SETUP.md`)
- [x] Founding PM session recorded (`docs/PM-SESSION-01.md`)

---

*Unchecked items above are the actual remaining gap between "documentation complete" and "environment ready" — they are the Kickoff Agent's starting task list, not a reflection of scope not yet decided.*

---

## Standing Pre-Project Data Audit

Before design or build begins on any Web Lab project, the following questions must be answered and documented:

1. Does existing data need to be migrated into this platform?
2. If yes — what format is the existing data in?
3. What is the target schema the data must conform to?
4. Who builds the import capability — a builder agent or is it a core platform feature?
5. Who performs the actual migration — developer or builder agent?
6. When in the phase sequence does migration happen?

These questions must be answered before Agent 1 BA/UX begins discovery. A data migration gap discovered in Phase 2 costs significantly more time than one surfaced in planning.

---

## Standing Methodology Rules

These rules apply to every Web Lab project from day one and must be verified before any builder agent opens.

1. **Last Updated date discipline** — every commit that modifies SOURCE_OF_TRUTH.md must update the Last Updated date field in the same commit. No exceptions. A commit that touches SOURCE_OF_TRUTH.md without bumping the Last Updated date is incomplete and creates context drift.
2. **Rule scope discipline** — every agent rule must be written to cover all scenarios it applies to, not just the most obvious one. When a rule gap is discovered mid-project it must be fixed immediately and logged as a methodology learning.
3. **README sync discipline** — the README Build Status table must stay in sync with the SOURCE_OF_TRUTH.md Phase Status table. They update together in the same commit on every phase change.
4. **Pre-project rule audit** — before Phase 1 Builder opens on any future Web Lab project, PM must audit all agent rules for narrow-scope gaps and stress-test them against realistic edge cases.
5. **Internal session checklist discipline** — every agent kickoff prompt must include this instruction: "Maintain an internal checklist during this session capturing: new conventions discovered, friction points and how they were resolved, observations about what worked better or worse than expected, and any minor self-resolved deviations from spec. Include this checklist in your final status report to PM." This applies to all agents that produce substantive work — builders, assembler, QA, documentation, code review. Consultation Agent is exempt since its outputs go to STRATEGY-LOG.md directly.
6. **Language specification in builder prompts** — builder agent prompts must explicitly state the programming language for every layer being built, not just the framework. Example: do not say Node.js and Express, say Node.js and Express in TypeScript. Implied language choices are not sufficient — the builder will default to its own judgment which may conflict with the project stack.

---

## Pre-Phase Audit Checklist

Before every builder agent opens, PM must complete this audit. This is not optional — it is a required gate that runs before Phase 1, Phase 2, and Phase 3 Builder agents receive their kickoff prompt. Estimated time: 5 minutes.

1. **Source of truth current** — confirm Last Updated date in SOURCE_OF_TRUTH.md matches the most recent commit date. If it does not, update it before proceeding.
2. **Phase Status table accurate** — confirm the Phase Status table reflects actual current state, not assumed state.
3. **README Build Status in sync** — confirm README Build Status table matches SOURCE_OF_TRUTH.md Phase Status table exactly.
4. **PM Radar reviewed** — scan all open radar items and confirm nothing on the radar is blocking the phase about to open.
5. **Repo structure confirmed** — confirm Section 9 repo structure is defined and locked for the phase about to open.
6. **Open Questions reviewed** — confirm no open question in Section 14 is blocking the phase about to open.
7. **Agent 1 BA/UX sign-off confirmed** — confirm any scope additions or changes discovered since the last phase have been reviewed with Agent 1 before the builder receives them.
8. **Credential inventory** — before Phase 2 Builder opens, PM must confirm: (a) what credentials the phase requires — database passwords, API keys, connection strings, (b) when and where those credentials were created — typically during Kickoff, (c) where they are stored — password manager, never in any project file, (d) how they reach each environment — local .env created manually by developer, server .env created independently via RDP, never transferred through GitHub. This inventory must be completed before the builder agent receives its kickoff prompt. A credential gap discovered mid-phase costs significantly more time than one surfaced in planning.
9. **Builder prompt quality check** — before issuing any builder agent kickoff prompt PM reviews the prompt explicitly for: (a) language specified for every layer being built — not just framework, (b) file structure confirmed against Section 9, (c) credentials and environment variables explicitly addressed, (d) reference documents named — ARCHITECTURE-BRIEF.md, LIFT-DATA-MAPPING.md, BA-UX-SPEC.md as applicable. A builder prompt that omits any of these is incomplete and must be revised before sending. This check prevents builder agents from making unilateral decisions on items that should be PM-directed.

If any of these nine items is not clean stop and resolve it before opening the builder agent.

---

## Tool Execution Workflows

For any project using Knex.js or a similar migration tool, document the full execution workflow before Phase 2 Builder opens. The workflow must clearly define: who writes the migration file, who reviews it, who commits it, who executes it on the server, and who confirms the result. No step in the workflow should be ambiguous about ownership.

Template: Agent writes → Developer reviews → Claude Code commits → Developer executes on server → Developer confirms.
