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
