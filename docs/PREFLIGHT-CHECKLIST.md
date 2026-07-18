# PRE-FLIGHT CHECKLIST
### Environment Setup — Agent 0 (Kickoff)
### Multi-Client Data Aggregation & Display Platform

**Date completed:** 2026-07-17
**Server:** `multi-client-platform-prod`

---

## Infrastructure

| Item | Value | Status |
|---|---|---|
| Cloud provider | AWS Lightsail | ✅ |
| Region | Ohio (us-east-2a) | ✅ |
| OS | Windows Server 2022 Datacenter (x64) | ✅ |
| Plan | $22/month — 2 vCPU / 2GB RAM / 60GB SSD | ✅ |
| Static public IP | 18.220.214.171 | ✅ Confirmed attached |
| IPv6 | Disabled | ✅ |
| Firewall (IPv4) | Ports 80 (HTTP), 443 (HTTPS), 3389 (RDP) open; SSH removed | ✅ |
| RDP access | Confirmed working | ✅ |

## Web Server

| Item | Value | Status |
|---|---|---|
| IIS | Installed via Server Manager | ✅ Verified — `http://localhost` loads default IIS page |
| URL Rewrite module | v2.1, x64 | ✅ Verified visible in IIS Manager |
| Application Request Routing (ARR) | v3.0, x64 | ✅ Verified — "Application Request Routing Cache" visible in IIS Manager |
| Public accessibility | `http://18.220.214.171` | ✅ Confirmed loading default IIS page from local network. ✅ Externally verified via yougetsignal.com open-port checker — port 80 confirmed open from outside developer's network. |

## Runtime

| Item | Value | Status |
|---|---|---|
| Node.js | v24.18.0 LTS | ✅ Verified via `node -v` |
| Note | PM decision 2026-07-14: v22 moved to Maintenance LTS, v24 is Active LTS. Local dev to be upgraded to match (tracked on PM Radar). | — |

## Database

| Item | Value | Status |
|---|---|---|
| MySQL Server | 8.0.46 (x64) | ✅ Installed, configured, running as Windows Service (`MySQL80`) |
| MySQL Workbench | 8.0.47 (x64) | ✅ Installed, connected successfully |
| Config type | Development Computer | ✅ |
| Port | 3306 (TCP/IP), 33060 (X Protocol) | ✅ Localhost only — not exposed to Windows Firewall |
| Authentication | Strong Password Encryption (MySQL 8 default) | ✅ |
| Root password | Set by developer, stored in local password manager | ✅ (never recorded in any file) |
| Platform database | `multi_client_platform` | ✅ Created |
| App user | `platform_app`@`localhost` | ✅ Created |
| App user privileges | SELECT, INSERT, UPDATE, DELETE on `multi_client_platform` only | ✅ Confirmed via `SHOW GRANTS` — no root/admin privileges retained |

## Known Deviations (full detail in Documentation Agent report)

1. **Provider journey:** Azure abandoned (Free Trial quota restrictions) → Kamatera abandoned (Windows licensing pushed cost to ~$58/month) → AWS Lightsail selected ($22/month flat, Windows included).
2. **Region:** Ohio (us-east-2a) selected over originally-specified N. Virginia — developer located in Cincinnati, lower latency, no functional downside. PM-approved.
3. **Node.js version:** v24 LTS selected over originally-specified v22 — v22 moved to Maintenance LTS in 2026. PM-approved; local dev environment upgrade pending.
4. **Unplanned software:** Node.js v24 installer's default options triggered installation of Chocolatey, Python 3.14 (x3 packages), Visual Studio 2026 Build Tools, and VC++ Redistributables. Not part of locked stack; no functional conflict identified. PM decision: leave in place, removal risk outweighs benefit.
5. **MySQL app user role (temporary):** MySQL Installer's role picker does not offer a database-scoped option. `platform_app` was temporarily assigned "DB Designer" (narrowest available) during setup, then immediately re-scoped via manual SQL (REVOKE + GRANT) to SELECT/INSERT/UPDATE/DELETE on `multi_client_platform` only. Final state confirmed via `SHOW GRANTS`.
6. **RDP clipboard limitation:** Browser-based RDP does not reliably support copy/paste between local machine and server. Worked around by manual retyping during Kickoff. Recommendation logged for PM Radar: switch to native RDP client (`.rdp` file + Windows Remote Desktop Connection) before Phase 1 begins, where larger code/config paste will be routine.
7. **Public accessibility verification:** Initial attempt via phone browser was inconclusive due to mobile browser address-bar/search behavior, not a server-side issue. Resolved by using an external open-port checker (yougetsignal.com) — confirmed port 80 open on `18.220.214.171` from a genuinely external network. No further action needed.

## Outstanding Items (not blocking Kickoff closure, tracked on PM Radar)

- Kamatera $10 security deposit — needs to be reclaimed by developer
- Local dev Node.js upgrade (v22 → v24)
- RDP clipboard/native client transition before Phase 1

---

*Prepared by Agent 0 (Kickoff) for PM review and GitHub commit via Claude Code.*
