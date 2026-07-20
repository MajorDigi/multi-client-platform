# Multi-Client Data Aggregation & Display Platform

A hosted platform that collects, organizes, and displays participant feedback from client engagements through one shared system — built once, reused across every client, not rebuilt per client.

## The Problem

This platform is built and operated by a consulting and facilitation practice, co-owned by the developer and his business partner, Ben. The practice runs structured engagements — workshops and sessions — for client organizations using the program *Understanding Yourself: A Framework for Change*. Every engagement generates participant feedback, and that feedback needs to be collected, aggregated, and made visible to the client organization and its stakeholders. Doing that manually, or rebuilding a one-off dashboard for every client, doesn't scale. This platform exists so it doesn't have to: one data pipeline, one dashboard, and every client organization gets access to their results through a shared public dashboard link.

**LIFT The Tri-State**, a workforce development program run through FreeStore Food Bank in Cincinnati, OH, is the platform's first client organization — a place an engagement has been delivered. LIFT does not own or drive the platform; the consulting practice does.

## How This Is Being Built

This project is also a working experiment in AI-assisted software development, and that's worth being upfront about. Rather than one long freeform Claude conversation, the build runs through an **11-agent roster**, each with a scoped job and a defined handoff point — a Kickoff agent for environment setup, a BA/UX agent for requirements, a PM agent that owns a living source-of-truth document, phase builders for each build stage, an Assembler, QA, Documentation, Code Review, and a Consultation agent that handles strategic thinking in a private layer separate from the build. Nothing moves to the next phase until the previous one is documented. No agent commits code directly — Claude Code, running locally in approval mode, is the only thing with GitHub write access, and every file change gets a human review before it lands.

It's slower than letting an AI agent run wild on a repo. That's the point — the goal is a repeatable, auditable process, not just a working app. `SOURCE_OF_TRUTH.md` in this repo is the actual coordination document every agent reads before doing anything; it's a reasonable place to see the methodology in practice rather than just described here.

## Locked Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Server | AWS Lightsail, Windows Server 2022 | Flat $22/month including Windows licensing, no quota friction. (Azure was tried first and abandoned over Free Trial VM quota restrictions; Kamatera was tried second and abandoned when licensing pushed real cost to ~$58/month.) |
| Web Server | IIS + URL Rewrite + ARR | Serves the Angular build, reverse-proxies API traffic. Chosen deliberately — hands-on production IIS experience is a stated goal of this project, not an accident of the stack. |
| API | Node.js + Express | Only layer allowed to talk to the database directly |
| Database | MySQL | No database-size cap (unlike SQL Server Express's 10GB limit), no licensing cost, works cleanly with Node's `mysql2` driver |
| Frontend | Angular + TypeScript + Tailwind CSS | Consistency with another active project, building on existing framework knowledge |

Traffic always flows one direction: `Browser → IIS → Node/Express → MySQL`. Nothing skips a layer.

## What V1 Delivers

- A flexible question-bank schema (questions/options stored as rows, not fixed columns) so new client engagements don't require schema changes
- One reactive dashboard that renders generically based on question type — not a custom dashboard per client
- Cross-engagement and cross-client data aggregation
- Two user types: shared-credential Admin, and a fully public Viewer with no login required
- Public PDF/CSV/DOCX export, no authentication required
- Rule-based auto-narrative summaries for multiple-choice data; open-text responses render as quote cards
- Two-layer data integrity: application-level locking on finalized records, plus soft-delete only — nothing is ever hard-deleted

QR-code self-entry was deliberately scoped out of V1 (logged as a candidate for a future standalone tool).

## Current Build Status

| Phase | Status |
|---|---|
| Pre-Kickoff Documentation | ✅ Complete |
| Environment Setup (Kickoff) | ✅ Complete — AWS Lightsail provisioned, IIS/Node/MySQL installed and verified |
| BA/UX Spec | ✅ Complete |
| Phase 1 — Static Hosting | ✅ Complete — Angular app served via IIS, externally verified |
| Phase 2 — API + Reverse Proxy | 🟡 In Progress |
| Phase 3 — Auth + TLS + Public Link | ⬜ Not Started |
| Final Assembly | ⬜ Not Started |

This is a real-time status, not a snapshot — check `SOURCE_OF_TRUTH.md` for the current state; it's updated after every significant decision or phase completion.

## Navigating This Repo

**Start here, in this order:**
1. `SOURCE_OF_TRUTH.md` — the authoritative coordination document. Project overview, locked stack, agent roster, decisions log, current phase status. Every agent (and any human) reads this first.
2. `docs/ENVIRONMENT-SETUP.md` — full Kickoff journey: cloud provider evaluation, server provisioning, IIS/MySQL setup, deviations from the original plan and why.
3. `docs/PM-SESSION-01.md` — the founding decisions log: why this project exists, why each agent role exists, why each stack choice was made.
4. `docs/BA-UX-SPEC.md` and `docs/ARCHITECTURE-BRIEF.md` — the functional spec for V1.

```
/
├── SOURCE_OF_TRUTH.md        ← read this first
├── README.md                 ← you are here
├── /docs
│   ├── BA-UX-SPEC.md
│   ├── PM-SESSION-01.md
│   ├── ENVIRONMENT-SETUP.md
│   ├── PHASE-1-COMPLETE.md   (once Phase 1 completes)
│   ├── PHASE-2-COMPLETE.md
│   └── PHASE-3-COMPLETE.md
├── /phase-1                  ← Phase 1 code
├── /phase-2                  ← Phase 2 code
└── /phase-3                  ← Phase 3 code
```

Phase-complete docs land in `/docs` as each phase finishes — those are the fastest way to see what actually got built, not just what was planned.

## A Note on Information Architecture

This repo is the public operational layer of the project — and that framing is deliberate.

In practice this means the project runs on two tiers. Tier 1 is everything in this repo — build decisions, stack choices, agent rules, phase status, decisions log. Public, auditable, and deliberately open. Tier 2 is a Consultation Agent and a set of local-only documents excluded via .gitignore — strategic thinking, vision notes, and methodology development that stays private until it is ready. The Consultation Agent appears in the agent roster as Agent 10. Its outputs never reach GitHub. The two tiers are not just conceptually separate — they are structurally enforced.

Build decisions, stack choices, agent rules, phase status, and decisions log entries belong in the open where they can be audited, learned from, and built on. Strategic thinking about where this goes next stays private until it is ready to be revealed, productized, or acted on deliberately.

The boundary is enforced mechanically via .gitignore, not just intentionally. The structure protects itself.

Most projects have information boundaries. Few design them explicitly. This one does.
