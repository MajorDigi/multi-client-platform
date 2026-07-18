# Environment Setup Guide
### Multi-Client Data Aggregation & Display Platform
**Owner:** Documentation Agent (Agent 8)
**Covers:** Full Kickoff journey — local environment through infrastructure provisioning to a verified, ready-to-build server
**Audience:** Written so a developer starting a similar project from scratch could follow it exactly
**Status:** Kickoff complete as of 2026-07-17

---

## Part 1 — Local Environment Setup

### 1.1 Prerequisites

- A GitHub account
- VS Code installed
- Windows or macOS machine with admin rights
- An Anthropic account with Claude Code access

### 1.2 Create the GitHub Repository

1. Create a new repository: `multi-client-platform`
2. Initialize with a `README.md`
3. **Make the repository public** — agent access to `SOURCE_OF_TRUTH.md` requires unauthenticated HTTP fetches via the raw URL standard (see Section 5.4). A private repo returns errors to any tool that isn't logged in.

### 1.3 Create a Personal Access Token (PAT)

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Scope to the `multi-client-platform` repo only
3. Grant: Contents (read/write), Metadata (read)
4. Set an expiration date — never "no expiration"
5. Store securely; never commit it

### 1.4 Install the VS Code GitHub Extension

1. Install **GitHub Pull Requests and Issues**
2. Sign in to GitHub from within VS Code
3. Confirm the signed-in account owns the repo

### 1.5 Clone the Repository Locally

```bash
git clone https://github.com/MajorDigi/multi-client-platform.git
cd multi-client-platform
code .
```

### 1.6 Install Node.js v24 LTS

**Original plan called for v22.** By the time of installation, Node v22 had moved to Maintenance LTS while v24 became the current Active LTS with support through April 2028. Server and local dev were standardized on v24 for consistency — see Section 5.2 for the deviation this caused.

1. Install Node v24 LTS from nodejs.org, or via `nvm install 24 && nvm use 24`
2. Confirm: `node -v` → `v24.x.x`

### 1.7 Install and Authenticate Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
claude --version
```

Run `claude` inside the repo folder, authenticate, and confirm it is running in **approval mode** — no file is written without explicit developer approval. This is a hard project rule, not a default setting.

### 1.8 Initialize CLAUDE.md via `/init`

Inside the Claude Code session:
```
/init
```
Review the generated `CLAUDE.md` and confirm it references `SOURCE_OF_TRUTH.md` as authoritative, approval-mode-only operation, and the GitHub bridge rule (Section 4.3 below).

### 1.9 .gitignore and Security Directives

```
.env
.env.local
.env.development
.env.production
.env.*.local
*.pem
*.key
*credentials*
*secret*
node_modules/
dist/
build/
*.log
npm-debug.log*
.vscode/
.DS_Store
Thumbs.db
```

Never commit: PAT, database credentials, any `.env` file, or server connection details (IP, admin credentials, RDP info). If a secret is committed by accident, treat it as compromised and rotate it — deleting the file in a later commit does not remove it from git history.

---

## Part 2 — Cloud Provider Evaluation

This project went through three infrastructure candidates before landing on the final choice. Each is documented here so future projects don't repeat the same dead ends.

### 2.1 Azure — Abandoned

**Plan:** Azure Virtual Machine, Windows Server, 12-month free tier. Originally locked as the primary choice specifically because the developer already uses Azure at work and gaining hands-on Azure/IIS experience was a stated project goal.

**What went wrong:** Azure's Free Trial tier enforces quota restrictions on B-series VMs that blocked provisioning the VM as planned. The standard path to raise the quota (a quota increase request) was itself broken/non-functional at the time. This turned a planned 30-minute provisioning step into an unresolvable blocker.

**Outcome:** Abandoned. The learning-value argument for Azure didn't survive a VM that couldn't actually be provisioned.

### 2.2 Kamatera — Abandoned

**Plan:** Kamatera VPS as an Azure alternative.

**What went wrong:** Kamatera's advertised compute pricing didn't include Windows Server licensing. Once Windows licensing was added, the real monthly cost came to approximately $58/month — roughly triple the advertised base price, and well outside what was reasonable for a side project server.

**Outcome:** Abandoned on cost grounds before provisioning was completed. A **$10 refundable security deposit** was paid to Kamatera during evaluation — this is still owed back and is an open item (see Section 6, Deviation #2).

### 2.3 AWS Lightsail — Selected

**Decision:** AWS Lightsail, Windows Server 2022, at a flat $22/month.

**Why this won:**
- Flat $22/month **includes** Windows Server licensing — no hidden add-on cost like Kamatera
- No quota-approval friction like Azure — the instance provisions directly
- Predictable, fixed pricing simplifies budgeting for a side project

This was a genuine pivot from the original locked stack (which specified Azure) — not a minor adjustment. See Section 6 for the full deviation record.

### 2.4 Region Selection — Ohio (us-east-2a)

Ohio was chosen over N. Virginia (AWS's more commonly defaulted-to US region) because the developer is physically located in Cincinnati, Ohio — geographic proximity gives lower latency with no functional downside.

---

## Part 3 — AWS Lightsail Instance Provisioning

### 3.1 Instance Specification

| Setting | Value |
|---|---|
| Provider | AWS Lightsail |
| OS | Windows Server 2022 |
| Region | Ohio (us-east-2a) |
| Plan | $22/month flat — 2GB RAM / 2 vCPU / 60GB SSD |
| Static IP | `18.220.214.171` |

### 3.2 Provisioning Steps

1. Create the Lightsail instance with the above specification
2. Attach a **static IP** to the instance — without this, the IP changes on every reboot, which breaks DNS/firewall rules and RDP shortcuts
3. Configure the instance firewall:
   - **Open:** HTTP (80), HTTPS (443), RDP (3389)
   - **Removed:** SSH (not needed on a Windows instance)
   - **Disabled:** IPv6 (kept the network surface simple and matched to what was actually being used)

---

## Part 4 — IIS Installation and Configuration

### 4.1 IIS Installation

Install IIS via Windows Server Manager → Add Roles and Features → Web Server (IIS) role.

### 4.2 The Process Failure Behind Rule 11

During this phase, a multi-step instruction was issued to Claude Code as a single combined block — the steps to perform, followed immediately by a developer-confirmation checkpoint tacked onto the end of the same instruction. Because the checkpoint wasn't its own standalone message, it didn't function as a real stopping point — work proceeded past the point where developer sign-off should have gated it.

**Resulting rule (Rule 11, `SOURCE_OF_TRUTH.md` Section 5):**
> Checkpoints must be issued as standalone singular instructions. A checkpoint is never embedded at the end of a multi-step instruction block. When a step requires developer confirmation before proceeding, that confirmation request is its own separate message — nothing else follows it until confirmation is received.

**Practical takeaway for future projects:** never bundle "do X, Y, Z, then confirm with me before Z" into one instruction. Issue the confirmation request as its own message, every time.

### 4.3 URL Rewrite and ARR Module Installation

1. Download and install the **URL Rewrite** module for IIS (Microsoft-provided)
2. Download and install **Application Request Routing (ARR)**
3. Verify both modules appear in IIS Manager under the server-level feature list — this is the reverse-proxy foundation Phase 2 depends on (IIS → Node/Express)

---

## Part 5 — Node.js and the Version Deviation

### 5.1 Server-Side Node.js Installation

Install Node.js **v24 LTS** on the Windows Server instance, matching the local dev requirement from Section 1.6.

### 5.2 The Unplanned Software Deviation

The Node.js v24 Windows installer brought along several additional components as a side effect, without being explicitly requested:

- Chocolatey (package manager)
- Python 3.14
- Visual Studio 2026 Build Tools
- VC++ Redistributables

**PM decision:** leave all of it in place. None of it conflicts with the locked stack, and the risk of manually removing components bundled by an official installer (potential for breaking the Node install itself) outweighs any benefit of a "cleaner" system. This was formally logged rather than silently accepted — see Section 6.

### 5.3 Local Dev Node Version Alignment

Local dev was originally on Node v22 (per the original ENVIRONMENT-SETUP.md). This still needs to be upgraded to v24 to match the server — tracked as an open item, not yet closed (Section 6, Deviation #5).

---

## Part 6 — MySQL Installation and Configuration

### 6.1 Installation

Install MySQL Community Edition on the Windows Server instance via the MySQL Installer. Community Edition was chosen deliberately over SQL Server: MySQL is fully free with no database size cap, while SQL Server Express caps at 10GB per database (a real constraint for a growing multi-client platform) and SQL Server Standard/Enterprise carry licensing costs. The Node.js `mysql2` driver works equally well with either, so there was no technical reason to prefer SQL Server in a Node.js stack.

### 6.2 Configuration Wizard

Run the MySQL Configuration Wizard:
1. Choose **Server Configuration Type** appropriate for a small VPS (Development or Server Computer, not Dedicated)
2. Set the root password — store it the same way as the PAT (secure, never in the repo)
3. Configure MySQL to run as a Windows Service, starting automatically with the server

### 6.3 Scoped Application User (`platform_app`)

Rather than having the Node/Express API connect as root, a scoped user was created:

```sql
CREATE USER 'platform_app'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON multi_client_platform.* TO 'platform_app'@'localhost';
FLUSH PRIVILEGES;
```

`platform_app` is scoped to the `multi_client_platform` database only — it cannot see or touch any other database on the instance. This is the credential the Node/Express layer will actually use.

### 6.4 Database Creation

```sql
CREATE DATABASE multi_client_platform;
```

This is the single database the platform's flexible question-bank schema (questions and options stored as rows, not fixed columns) will live in, shared across all client engagements per the locked architecture.

---

## Part 7 — External Firewall Verification

### 7.1 The Phone Browser Failure

The first attempt to verify the server was reachable from outside the local network used a phone's mobile browser, navigating directly to the server's IP. This did not give a reliable, unambiguous result — a phone browser attempting to load an IP with no service properly configured yet doesn't clearly distinguish between "port closed/blocked" and "port open but nothing listening," making it useless as a real verification method.

### 7.2 The Correct Method

Verification was redone using a dedicated open-port checking tool: **yougetsignal.com** (Open Port Check tool). The server's static IP and the relevant port were entered directly, giving a clear, unambiguous open/closed result.

**Resulting standing rule (Rule 12, `SOURCE_OF_TRUTH.md` Section 5):**
> External accessibility and firewall verification must always use a dedicated open-port checking tool such as https://www.yougetsignal.com/tools/open-ports — never a mobile device browser. Enter the server IP and port number and confirm an unambiguous open or closed result. This applies to all agents performing any external reachability check in any phase.

---

## Part 8 — RDP Clipboard Limitation (Known Constraint)

**Discovery:** Connecting to the Windows Server instance via **browser-based RDP** (Lightsail's built-in browser client) does not support clipboard paste between the local machine and the remote session.

**Impact:** This is a real friction point for anything involving pasting code, config values, or long strings (passwords, connection strings) into the remote session — exactly the kind of work Phase 1 onward requires constantly.

**Fix, not yet applied:** Switch to a **native RDP client** — download the `.rdp` file from the Lightsail console and open it with the Windows Remote Desktop Connection app instead of the browser client. This restores clipboard support. Logged as a required switch to make **before Phase 1 begins** (Section 6, Deviation #6) — low effort, high impact.

---

## Part 9 — Kickoff Definition of Done

- [x] Repo created, public, PAT scoped and stored securely
- [x] VS Code GitHub extension installed and signed in
- [x] Repo cloned locally
- [x] Node v24 installed and confirmed (local — server side confirmed; local upgrade from v22 still pending, see Deviations)
- [x] Claude Code CLI installed, authenticated, approval mode confirmed
- [x] `CLAUDE.md` initialized via `/init`
- [x] `.gitignore` in place, no secrets committed
- [x] AWS Lightsail instance provisioned — Windows Server 2022, Ohio us-east-2a, static IP `18.220.214.171`, $22/month
- [x] Firewall configured — HTTP/HTTPS/RDP open, SSH removed, IPv6 disabled
- [x] IIS installed
- [x] URL Rewrite and ARR modules installed
- [x] MySQL installed, configured, `platform_app` scoped user created, `multi_client_platform` database created
- [x] External accessibility verified via yougetsignal.com
- [ ] RDP switched to native client (clipboard fix) — **pending, before Phase 1**
- [ ] Local dev Node upgraded from v22 to v24 — **pending**
- [ ] Kamatera $10 deposit reclaimed — **pending**

---

## Part 10 — Full Deviation Log

A complete record of every point where this project's actual path diverged from the original plan. Kept here as a single reference rather than scattered across the Decisions Log.

| # | Deviation | Original Plan | What Actually Happened | Resolution |
|---|---|---|---|---|
| 1 | Cloud provider | Azure VM | Azure abandoned (Free Trial quota restrictions on B-series VMs, broken quota-increase process) → Kamatera abandoned (Windows licensing pushed real cost to ~$58/month) → AWS Lightsail selected ($22/month flat, Windows included, no quota friction) | Resolved — Lightsail provisioned and verified |
| 2 | Kamatera deposit | N/A | $10 refundable security deposit paid during Kamatera evaluation, never reclaimed | **Open** — developer needs to reclaim via Kamatera billing console |
| 3 | Node.js version | v22 | Upgraded to v24 LTS — v22 moved to Maintenance LTS in 2026, v24 is Active LTS through April 2028 | Resolved on server; local dev upgrade still pending (#5) |
| 4 | Unplanned software installs | N/A | Node v24 installer brought in Chocolatey, Python 3.14, VS 2026 Build Tools, VC++ Redistributables as side effects | Resolved — PM decision to leave in place, no conflict with stack |
| 5 | Local dev Node version | Match server (v24) | Local VS Code environment still on v22 | **Open** — upgrade after Kickoff closes |
| 6 | RDP clipboard | N/A | Browser-based RDP found to not support clipboard paste | **Open** — switch to native RDP client (.rdp file) before Phase 1 |
| 7 | Checkpoint process | N/A | Multi-step instruction with an embedded end-of-block checkpoint failed to gate developer confirmation properly | Resolved — Rule 11 established, checkpoints now always standalone messages |
| 8 | Firewall verification method | N/A | Phone browser gave an unreliable result | Resolved — Rule 12 established, yougetsignal.com is now the standard method |

---

*This document supersedes the previous version of `ENVIRONMENT-SETUP.md`, which covered local setup only and predated Kickoff completion.*
