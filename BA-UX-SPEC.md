# BA-UX-SPEC.md
### Multi-Client Data Aggregation & Display Platform — Product Spec
**Author:** Agent 1 — BA/UX
**Status:** Draft for PM Review
**Date:** 2026-07-12

---

## 1. Platform Purpose & Core Value Proposition

This platform is owned and operated by the developer and business partner Ben Lemmon, under the shared program/business name **"Understanding Yourself: A Framework for Change."**

Ben develops and teaches the program material. The developer arranges client engagements, collects participant feedback via response sheets after each session, and aggregates the resulting data. This platform is the public home for that data.

**Core value proposition:**
- For **past and current clients** (e.g., LIFT The Tri-State): a permanent, shareable home for their engagement results — dataset, aggregation, and formatted summaries — replacing manual one-off report emails.
- For **prospective clients**: public proof that the program produces measurable outcomes across different audiences and industries (job seekers, corporate teams, etc.), using real data from past engagements as a sales and credibility asset.

The platform is not built for one client. LIFT is the first client; the platform is designed from day one to hold engagement data for any number of future clients under the same structure.

---

## 2. User Types

There are exactly two user types in V1. There is no client-specific login tier.

### Admin
- Single shared login/credentials, used by the developer and Ben Lemmon interchangeably.
- No permission tiers between the two admins — both have identical, full write access.
- Can: enter engagement data, manage the question bank per engagement, correct data during the input process.
- Cannot: edit or delete engagement data once it has been finalized (see Architecture Brief, Data Integrity Model).
- Gated behind login. This is the only part of the platform requiring authentication.

### Viewer
- Anyone with the URL. No login, no account, no registration.
- Can: browse all clients and engagements, view raw data, aggregation, and summary views, use the cross-engagement comparison tool, and export data (PDF, CSV, DOCX) for any engagement.
- Cannot: create, edit, or delete any data.

**Rationale:** The data displayed is sanitized program-outcome data, not sensitive or proprietary information, and it is owned by the platform operators, not the client organizations. Restricting viewing or export to logged-in users would require building client account management with no corresponding benefit for V1.

---

## 3. Client Engagement Model

A **client** is the organization that contracts for a program engagement (e.g., LIFT The Tri-State). Individual session attendees (LIFT's own clients/participants) are never tracked as identities — they exist only as anonymous respondent records tied to a specific engagement.

**Adding a new client to the platform means:**
1. An admin creates a client record (name, and any relevant category info such as audience type — e.g., job seekers, corporate).
2. The admin defines the question set for that client's first engagement via the Manage Questions screen (may reuse a prior client's question set, or set up new/tailored questions).
3. Post-engagement, the admin enters response sheet data via the bulk entry grid.
4. Once finalized, that engagement's data becomes visible to any Viewer.

There is currently no formal client-facing opt-in/consent workflow built into the platform — this is treated as a business-process matter, not a platform feature, in V1. There is no visibility flag to keep a specific client's data private; all finalized data is public.

---

## 4. V1 Feature Set

### In V1
- Admin login (single shared credential set, no permission tiers)
- Bulk grid-style data entry (spreadsheet-style, one row per respondent), editable/deletable only prior to finalization
- Manage Questions admin screen — add, reorder, and retire (mark inactive) questions per client/engagement, no fixed schema, no code changes required to evolve a question set
- Public landing page (program/platform overview)
- Viewable Engagements selector — grouped by client, sorted by date within each client
- Single reactive dashboard per engagement, with three views in one page: Raw Data / Aggregation / Summary (tab-based, URL-addressable so a specific view can be shared directly)
- Cross-engagement / cross-client aggregation view — combine data across multiple engagements and clients
- Rule-based auto-generated narrative findings for multiple-choice questions (threshold-based sentence templates, no AI generation, no manual per-engagement writing)
- Open-text questions rendered as quote cards, no auto-generated narrative
- Export: PDF, CSV, and DOCX, available to any Viewer, no login required
- Public client list, shown by full name

### Explicitly Out of V1
- QR-code / self-service digital response entry (public write access) — logged as a candidate for a separate, standalone future tool, not a feature of this platform
- Client user accounts or any client-facing login tier
- Per-viewer customization of which questions/metrics display within an engagement (Viewers always see the complete response sheet results)
- Client data privacy/visibility flags (all finalized data is public by default)
- AI-generated narrative summaries

---

## 5. Dashboard Configuration

### Summary Levels
- **Raw Data** — every individual respondent's answers for the selected engagement.
- **Aggregation** — calculated metrics: response distributions, percentages, before/after comparisons, per-question breakdowns.
- **Summary** — formatted, presentation-ready view combining key metrics with rule-based narrative findings (multiple-choice questions) and representative quote cards (open-text questions).

### Display Types
- Metric cards (headline stats)
- Before/after comparison displays (for paired questions, e.g., clarity before vs. after)
- Horizontal bar charts (for multiple-choice distributions)
- Quote cards (for open-text responses)
- Completion tracker (per-respondent completion status)
- Rule-based narrative findings block
- Cross-engagement comparison view (trend-style, combining metrics across selected engagements)

### Filtering
- Filter by engagement (single engagement, the default per-engagement dashboard)
- Filter/select across multiple engagements or clients for the cross-engagement aggregation view
- No per-question or per-metric filtering by Viewers — engagement selection is the only filter exposed in V1

---

## 6. Public Shareable Link Concept

There is no distinction between "what a client sees" and "what a public visitor sees" — both are Viewers, and both get the identical experience. A shareable link is simply a normal URL into the application (e.g., a specific engagement's Summary tab), addressable and shareable by anyone, including clients themselves (e.g., a program manager sharing their engagement's summary link with their own leadership).

Admins see everything Viewers see, plus the ability to log in and access data entry and question management — there is no separate "admin dashboard" with different data, only an additional entry point for write actions.
