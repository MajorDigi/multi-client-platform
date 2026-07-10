# Environment Setup Guide
### Multi-Client Data Aggregation & Display Platform
**Owner:** Documentation Agent (Agent 8)
**Covers:** Everything completed before Kickoff (Agent 0)
**Audience:** Written so a developer starting from zero can follow it exactly

---

## 1. Prerequisites

- A GitHub account
- VS Code installed
- Windows or macOS machine with admin rights (to install Node and CLI tools)
- An Anthropic account with Claude Code access

---

## 2. Create the GitHub Repository

1. Go to github.com and create a new repository: `multi-client-platform`
2. Initialize it with a `README.md`
3. **Make the repository public.**
   - Agent access to `SOURCE_OF_TRUTH.md` requires unauthenticated HTTP fetches (see Section 9). A private repo returns 404/permission errors to any tool that isn't logged in.
   - Public was chosen deliberately over managing token-based read access for every agent session.

---

## 3. Create a Personal Access Token (PAT)

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Scope it to the `multi-client-platform` repo only
3. Grant: **Contents (read/write)**, **Metadata (read)**
4. Set an expiration date (do not use "no expiration")
5. Copy the token immediately — GitHub will not show it again
6. Store it somewhere secure (password manager, not in any file inside the repo)

This PAT authenticates git operations from the local machine and from Claude Code. It is not used for any agent's read access to the source of truth (that path is public/unauthenticated — see Section 9).

---

## 4. Install the VS Code GitHub Extension

1. In VS Code, open Extensions
2. Install **GitHub Pull Requests and Issues** (and confirm **GitLens** or the built-in Source Control panel is usable)
3. Sign in to GitHub from within VS Code when prompted
4. Confirm the account shown matches the account that owns `multi-client-platform`

---

## 5. Clone the Repository Locally

```bash
git clone https://github.com/MajorDigi/multi-client-platform.git
cd multi-client-platform
code .
```

Confirm the repo opens in VS Code with the `README.md` visible.

---

## 6. Update Node.js to v22

1. Check current version: `node -v`
2. If not on v22.x, install/update:
   - Windows: download the v22 LTS installer from nodejs.org, or `nvm install 22` / `nvm use 22` if using nvm-windows
   - macOS: `nvm install 22 && nvm use 22`, or `brew upgrade node`
3. Confirm: `node -v` → should report `v22.x.x`
4. Confirm npm came along with it: `npm -v`

Node v22 is the floor version for this project — confirm this matches whatever your Phase 2 Builder Agent assumes before writing the Express API.

---

## 7. Install and Authenticate Claude Code CLI

1. Install:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
2. Verify install: `claude --version`
3. From inside the repo folder, run `claude` to launch it
4. Authenticate when prompted (this links the CLI to your Anthropic account)
5. Confirm Claude Code is running in **approval mode** — no file should be written without you explicitly approving the change first. This is a hard rule for the project, not just a default setting; verify it before proceeding.

---

## 8. Initialize CLAUDE.md via `/init`

1. Inside the Claude Code session, run:
   ```
   /init
   ```
2. This scaffolds a `CLAUDE.md` file at the repo root — the project-level memory file Claude Code reads at the start of every session in this repo
3. Review the generated `CLAUDE.md` and confirm/edit it to reference:
   - This project is governed by `SOURCE_OF_TRUTH.md` — Claude Code should treat that file as authoritative
   - Approval-mode-only, no autonomous file writes
   - The GitHub bridge rule (Section 10 below)

---

## 9. .gitignore and Security Directives

1. Add a `.gitignore` at the repo root covering at minimum:
   ```
   node_modules/
   .env
   .env.local
   *.log
   .DS_Store
   ```
2. **Never commit:**
   - The GitHub PAT
   - Database credentials
   - Any `.env` file
   - Azure VM connection details (IP, admin credentials, RDP info)
3. If any secret is committed by accident, treat it as compromised — rotate it immediately, don't just delete the file in a later commit (git history retains it).
4. These directives live in `CLAUDE.md` as a standing instruction so every future agent session is reminded of them.

---

## 10. The GitHub MCP Connector Limitation — and Why Claude Code Is the Bridge

**What was tried:** A GitHub MCP connector was searched for in the Claude connector directory as a way to let agent chats read from and commit directly to the repo.

**Finding:** No GitHub MCP connector was available. Claude Code was confirmed as the sole GitHub write-bridge for this project.

**Why this is the right outcome, not just a fallback:** Per the project's rule (`SOURCE_OF_TRUTH.md`, Section 5, rule 9), no agent commits directly to GitHub. Claude Code's approval-mode workflow already enforces developer review before any commit — which aligns directly with the project's core principle of no autonomous file writes. Even if a direct-write MCP connector becomes available later, it would bypass that review step, so Claude Code remains the intended bridge regardless.

**The bridge, as it works today:** Chat-based agents (like this Documentation Agent) produce content; the developer copies it into local files; Claude Code stages, commits, and pushes — with the developer approving each step. This keeps a human review gate between any AI-generated content and the actual repository history.

*This is now a recorded decision in `SOURCE_OF_TRUTH.md`'s Decisions Log — confirmed by the PM Agent.*

---

## 11. Raw URL vs. Blob URL — Discovery for Agent Access

**The problem:** Across multiple agent sessions, fetching `SOURCE_OF_TRUTH.md` via the standard GitHub web URL —
```
https://github.com/MajorDigi/multi-client-platform/blob/main/SOURCE_OF_TRUTH.md
```
— returned a 404 for Claude's fetch tool, even once the repo was public. This happened repeatedly, not as a one-off fluke.

**The fix:** Switch to the **raw content URL**:
```
https://raw.githubusercontent.com/MajorDigi/multi-client-platform/main/SOURCE_OF_TRUTH.md
```
This serves the file as plain text with no GitHub UI wrapper and resolved the fetch failures.

**Standing rule (confirmed by PM Agent):** Every future agent kickoff prompt in this project — and any future project using the same multi-agent workflow — must reference repository documents using the `raw.githubusercontent.com` form, never the `github.com/.../blob/...` form.

---

## 12. Environment Setup — Definition of Done

- [ ] Repo created and set to public
- [ ] PAT generated, scoped, stored securely (not in repo)
- [ ] VS Code GitHub extension installed and signed in
- [ ] Repo cloned locally
- [ ] Node v22 confirmed (`node -v`)
- [ ] Claude Code CLI installed, authenticated, confirmed running in approval mode
- [ ] `CLAUDE.md` initialized via `/init` and reviewed
- [ ] `.gitignore` in place, no secrets committed
- [ ] Raw URL confirmed working for `SOURCE_OF_TRUTH.md` fetch
- [ ] Kickoff Agent (Agent 0) can confirm environment is ready
