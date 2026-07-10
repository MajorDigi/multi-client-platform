# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repository is currently **pre-kickoff** — it contains only planning documents (`README.md`, `SOURCE_OF_TRUTH.md`). No application code, package manifests, or build tooling exist yet. There are no build/lint/test commands to run until Phase 1 work begins. Once code is added, update this file with the real commands (Angular build/serve/test, Node/Express start/test scripts, etc.).

## Read SOURCE_OF_TRUTH.md first

`SOURCE_OF_TRUTH.md` is the authoritative project spec and process document. Read it before doing any work in this repo — it is updated by the "PM Agent" and takes precedence over assumptions or prior conversation context. If a request conflicts with it, flag the conflict instead of proceeding.

## What this project is

A multi-client data aggregation and dashboard platform: the platform is the product, built once and extended per client. The first client is **LIFT The Tri-State** (a workforce development program run through FreeStore Food Bank, Cincinnati OH), but the codebase must stay client-agnostic — avoid hardcoding LIFT-specific assumptions into shared/platform code.

## Locked technical stack

Do not suggest alternative stacks — these choices are locked in `SOURCE_OF_TRUTH.md`:

| Layer | Technology | Role |
|-------|-----------|------|
| Version Control | GitHub | Source of truth bridging local dev and the server |
| Server | Azure Virtual Machine (Windows Server) | Hosts everything publicly |
| Web Server | IIS + URL Rewrite + ARR | Serves the Angular app, reverse-proxies `/api/*` to Node |
| API | Node.js + Express | Business logic, queries MySQL, never exposed directly to the internet |
| Database | MySQL | Data storage on the Azure VM; only Node talks to it |
| Frontend | Angular + TypeScript + Tailwind CSS | Served as static files by IIS |

Request flow is strictly layered and must not be bypassed:

```
Browser → IIS (serves Angular, proxies /api/* to Node) → Node/Express → MySQL
```

- Nothing talks to MySQL except Node.
- Nothing talks to Node except IIS.
- All outside traffic goes through IIS first.

## Planned repository layout

Once phases begin, code is expected to land under this structure (see `SOURCE_OF_TRUTH.md` §7 for the canonical version):

```
/docs                  ← BA/UX spec and phase-completion docs
/phase-1                ← Static IIS hosting of the Angular build
/phase-2                ← Node/Express API + MySQL + IIS reverse proxy
/phase-3                ← Auth, TLS, public shareable link
```

## Multi-agent workflow — this repo is developed by a defined roster of AI "agents"

This project is built using a structured multi-agent process, not ad-hoc changes. When operating as or on behalf of one of these roles, stay strictly within that role's lane (full roster and rules in `SOURCE_OF_TRUTH.md` §4–5):

- **Kickoff** → **BA/UX** → **Project Manager** → **Phase 1/2/3 Builders** → **Assembler** → **QA/Testing** → **Documentation** → **Code Review**
- Phases are gated: a phase cannot start until the previous phase has been documented by the Documentation Agent, and only the Assembler (after QA has tested) can sign off a phase as complete — Code Review cannot approve phase completion.
- The Code Review Agent activates starting Phase 2 (Phase 1 is static config with minimal code to review).
- No agent re-litigates decisions already recorded in `SOURCE_OF_TRUTH.md`'s Decisions Log; unclear or conflicting situations get escalated back to the PM Agent, not resolved unilaterally.
- Claude Code is treated as running in **approval mode only** for this project: every file write is expected to be reviewed by the developer before being applied — do not treat prior approvals as blanket authorization for unattended/autonomous changes.
- **No agent commits directly to GitHub.** Agents (BA/UX, PM, Builders, Assembler, QA, Documentation, Code Review) produce documents and code in chat only. The developer saves those files locally in VS Code. Claude Code is the sole GitHub bridge: it receives the files produced in agent chat sessions, commits them, and pushes to GitHub. Do not push on behalf of an agent role without the developer explicitly directing the commit/push here.

## Security — secrets must never reach GitHub

This is a hard rule, not a suggestion:

- Never commit `.env` files (`.env`, `.env.local`, `.env.production`, etc.), API keys, passwords, connection strings, Azure credentials, MySQL credentials, or any other secret material to this repository.
- Before running any `git commit`, check the staged diff for exposed secrets (credentials, tokens, private keys, connection strings) and stop to flag it instead of committing if anything looks like a secret.
- Config that includes real secrets belongs in untracked local files (`.env`) or Azure/IIS-side configuration on the VM — never in tracked source, docs, or commit messages.
- If a secret is ever accidentally committed, treat it as compromised (rotate/revoke it) rather than just deleting it from the latest commit — it remains in git history.
- Rely on `.gitignore` to keep secret-shaped files untracked, but don't treat `.gitignore` alone as sufficient — still check diffs before committing, since a secret can be pasted into a tracked file.

## GitHub URL Standards

Always use `raw.githubusercontent.com` URLs when referencing GitHub files in agent prompts. The blob URL format (`github.com/user/repo/blob/main/file`) returns 404 for Claude's fetch tool. The correct format is:

```
https://raw.githubusercontent.com/MajorDigi/multi-client-platform/main/FILENAME.md
```

Example: `SOURCE_OF_TRUTH.md` is accessed at `https://raw.githubusercontent.com/MajorDigi/multi-client-platform/main/SOURCE_OF_TRUTH.md`

## Updating SOURCE_OF_TRUTH.md

Significant decisions and phase completions are expected to be recorded in `SOURCE_OF_TRUTH.md`'s Decisions Log and Phase Status table (this is the PM Agent's job per the roster above). If you make or observe a locked decision or complete a phase gate, update the relevant table there rather than leaving it only in chat/commit history.
