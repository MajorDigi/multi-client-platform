# ARCHITECTURE-BRIEF.md
### Multi-Client Data Aggregation & Display Platform — Architecture Brief
**Author:** Agent 1 — BA/UX
**Status:** Draft for PM Review
**Date:** 2026-07-12
**Scope note (Rule 10):** This document covers the application's internal structure only — data model, API behavior, and display-layer organization. Server, hosting, and infrastructure decisions are owned by Kickoff/PM and are out of scope here.

---

## 1. Data Model — MySQL

The schema uses a **flexible question-bank model**, not fixed columns per question. This was a deliberate choice: response sheet questions are expected to evolve per client and over time, and a fixed-column schema would require a database migration every time a question changes. Under this model, adding, changing, or retiring a question is a data operation (insert/update a row), never a schema change.

### Core tables (conceptual, not final column-level spec)

**clients**
- Client organization record (name, audience/category info). Public by full name, no visibility flag in V1.

**engagements**
- One row per client engagement (session). Belongs to a client. Carries date, and a `status` field — see Section 5, Data Integrity Model.

**questions**
- The question bank. Each row is one question, scoped to a client or engagement, with: question text, type (multiple choice or open text), answer options (if multiple choice), display order, and an `active` flag (never hard-deleted, only marked inactive so historical engagement data always renders correctly).
- May optionally carry threshold-based narrative rules (see Section 5, Rule-Based Narrative Generation).

**respondents**
- One row per anonymous respondent within an engagement. No PII fields exist in the schema by design — sanitization is enforced structurally, not by a scrubbing step after entry. Carries completion tracking (answered/unanswered question count).

**responses**
- One row per answer: links a respondent to a question to their given answer. This join-table structure is what allows different clients/engagements to have entirely different question sets without schema changes.

This is a deliberate three-layer join (questions → respondents → responses) rather than a flat table. The tradeoff is explicit: slightly more complex queries in exchange for zero schema migrations as the business evolves.

---

## 2. API Layer — Per-Client Data Serving

The API (Node.js/Express) is the only layer that talks to MySQL. Its responsibilities relevant to this brief:

- **Read endpoints** (public, no auth): serve client lists, engagement lists, and engagement data (raw/aggregation/summary) filtered by client and/or engagement ID. Also serves the combined cross-engagement/cross-client aggregation view.
- **Write endpoints** (admin-gated): engagement/respondent/response entry and editing, and question bank management (create question, mark inactive, reorder).
- The dashboard is **data-driven, not client-specific**: it does not contain per-client display logic. It renders generically based on question `type` (multiple choice → bar chart / narrative rule; open text → quote cards), so no new dashboard code is needed when a new client or new question set is added.
- Export endpoints (PDF/CSV/DOCX) are public, no auth — consistent with the Viewer access model. They query the same read paths as the dashboard and format the result into a downloadable document.

---

## 3. Display Layer Organization

The frontend (Angular) is a single-page application. Key organizational points for Phase 1/3 builders:

- **Landing page** — static overview content.
- **Viewable Engagements selector** — a single component listing all engagements, grouped by client and sorted by date within each client group.
- **Engagement Dashboard** — one reusable component/route (e.g., `/engagement/:id`) that renders based on whichever engagement's data is loaded. Contains three tab-states (Raw Data / Aggregation / Summary) within a single route, with the active tab reflected in the URL (e.g., via a route parameter or query param) so a specific view is directly shareable.
- **Cross-Engagement Aggregation view** — a separate route/component that accepts a set of engagement/client selections and renders combined metrics using the same generic, question-type-driven rendering logic as the single-engagement dashboard.
- **Manage Questions (admin)** — an admin-only screen, gated behind the login, for CRUD-style management of the question bank per client/engagement.
- **Data Entry (admin)** — a bulk, grid-style entry screen (spreadsheet-like: one row per respondent, one column per active question for the selected engagement), rendered dynamically based on that engagement's active questions from the question bank. Rows/cells are editable and deletable only while the engagement is in `active` (unfinalized) status.

No component in the display layer should hardcode a specific client's or engagement's question identities. All rendering — dashboard, entry grid, exports — must be driven by the question bank's `type` and `active` status.

---

## 4. Data Upload Flow

1. Admin logs in.
2. Admin selects (or creates) the engagement to enter data for.
3. If new questions are needed for this engagement, admin uses Manage Questions first to add them to the question bank (no code changes required).
4. Admin transcribes paper response sheets into the bulk entry grid, which dynamically renders one column per active question for that engagement.
5. While the engagement's `status` is `active`, entered rows can be freely corrected or removed to fix transcription mistakes.
6. Admin finalizes the engagement, transitioning its `status` from `active` to `finalized` (see Section 5).
7. Once finalized, the engagement's data becomes visible to all Viewers and is subject to the read-only enforcement described below.

**Explicitly excluded from this flow in V1:** any form of public/respondent self-entry (e.g., QR-code-driven digital submission). This has been identified as a candidate for a separate, standalone future tool that would sit outside this platform entirely, with the admin still acting as a review gate before any such data enters this system. No public write endpoint should be built against this schema in V1.

---

## 5. Data Integrity Model (PM-Directed — Two-Layer Approach)

This section defines mandatory constraints. Phase 2 Builder must design every write endpoint and the MySQL schema around these rules from the outset — they are not optional or deferred hardening.

### Layer 1 — Application-Level Lock
The API enforces read-only status on finalized engagement records. **No edit or delete endpoints exist for finalized data.** This is enforced in Node.js/Express at the API layer, not at the database level. This is intentionally simple and is considered sufficient for V1 — there is no database-level trigger or constraint layer backing this in V1.

### Layer 2 — Soft Delete Pattern
No record is ever hard-deleted from MySQL. Every relevant record (engagements, at minimum — Phase 2 Builder to confirm exact table scope) carries a `status` column with three possible states:
- **active** — still in the input/entry process; freely editable and deletable at the application level.
- **finalized** — locked; no edit or delete endpoints apply, per Layer 1.
- **archived** — the soft-delete state. "Deleting" a record at any point means setting `status = archived`, never removing the row. Archived data remains in the database and is queryable for audit purposes; it is simply excluded from default Viewer-facing queries.

**Design implication for Phase 2 Builder:** every read query serving Viewer-facing data must explicitly filter for `status IN ('finalized')` (or the appropriate non-archived state) — archived and still-active/unfinalized data must never leak into public views by default.

---

## 6. Executive Summary vs. Detailed View — Data Terms

- **Detailed/Raw view**: every individual respondent's answers for the selected engagement, unaggregated.
- **Aggregation view**: calculated distributions and percentages per question, before/after comparisons where applicable — numeric, no narrative.
- **Summary/Executive Summary view**: aggregation-level metrics plus:
  - **Rule-Based Narrative Generation** (multiple-choice questions only): each such question in the question bank may carry a set of threshold-to-sentence mapping rules (e.g., "if positive-response % ≥ 75%, use sentence template A; if 50–74%, use template B," etc.). At render/export time, the API calculates the actual percentage for that engagement and selects the matching pre-written sentence. This is deterministic, rule-based logic — not AI-generated and not manually authored per engagement. Rules are defined once, when a question is set up.
  - **Quote cards** for open-text questions — displayed as-is, with no auto-generated interpretive narrative attached.
  - The same rule-based logic pattern extends to the **cross-engagement view** for trend-style findings (e.g., comparing a metric's value across two or more engagements).

---

## 7. Technical Constraints & Decisions for PM / Phase 1

- Flexible question-bank schema is a **locked architectural decision** — Phase 1/2 Builders should not default to fixed per-question columns even for the initial LIFT dataset, since the schema must accommodate future clients with different question sets from day one.
- No public write endpoints exist against this schema in V1 — only the admin-gated entry and question-management endpoints write data.
- Dashboard and entry-grid components must be built generically (driven by question `type`), not hardcoded per client — this is required for the "one platform, many clients" model to hold.
- Data Integrity Model (Section 5) is a hard constraint on endpoint design, not a nice-to-have — no edit/delete endpoint should ever be built against `finalized` data.
- Two seed datasets (LIFT Session 1 — April 27, 2026, 8 respondents; LIFT Session 2 — June 15, 2026, 15 respondents) are available to load into the question-bank/respondent/response schema at launch, once the schema is implemented.
