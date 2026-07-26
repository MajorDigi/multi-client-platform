# LIFT-DATA-MAPPING.md
### LIFT CSV → Flexible Question-Bank Schema — Mapping Specification
**Author:** Agent 1 — BA/UX
**Status:** Complete — Import Spec for Phase 2 Builder
**Date:** 2026-07-25

---

## 1. Schema Structure

Seven tables, consistent with the flexible question-bank model locked in `ARCHITECTURE-BRIEF.md`:

- **programs** — the framework/curriculum being delivered (e.g., "Understanding Yourself: A Framework for Change"). One row exists across all clients; tailoring happens at the question level, not by duplicating the program.
- **clients** — the contracting organization (e.g., "LIFT The Tri-State"). Carries a parent/host organization field where relevant (e.g., FreeStore Food Bank) and an audience/category field (e.g., Job Seekers).
- **sessions** — one row per engagement. Belongs to a client and a program. Carries date, a session label/number, and `status` (active / finalized / archived, per the Data Integrity Model).
- **questions** — the question bank. Scoped to a client (reused across that client's sessions unless a specific session requires a variant). Carries question text, `question_type` (`multiple_choice` or `open_text`), display order, and `active` flag.
- **options** — valid answer choices for a `multiple_choice` question. One row per selectable option, linked to a question, with display order.
- **respondents** — one row per anonymous participant within a session. Carries `response_id`, `role_type`, and denormalized completion fields.
- **responses** — one row per answer: links a respondent to a question, with either an `option_id` (multiple choice) or free-text `answer_text` (open text).

---

## 2. Column-by-Column Mapping

| CSV Column | Maps To | Notes |
|---|---|---|
| `session` | `sessions.session_label` | e.g., "Session 1" — human-readable label, distinct from the internal `sessions.id` |
| `organization` | `clients.parent_organization` | Static per client (e.g., "FreeStore Food Bank"). Captured once at the client level, not repeated per respondent row. |
| `program` | `clients.name` | **Important distinction:** in this CSV, "program" holds "LIFT The Tri-State" — this is the *client's* program name, not the *framework* we deliver. It maps to `clients.name`, not to the `programs` table. `programs.name` ("Understanding Yourself: A Framework for Change") has no corresponding column in this CSV at all — the original prototype was single-framework, single-client, so it never needed to record it. |
| `date` | `sessions.date` | |
| `response_id` | `respondents.response_id` | |
| `role_type` | `respondents.role_type` | |
| `q1_before_clarity` | new row in `questions` (client-scoped) + one `responses` row per respondent | multiple choice — see Section 3 |
| `q1b_after_clarity` | new row in `questions` | multiple choice — see Section 3 |
| `q2_most_helpful` | new row in `questions` | open text — see Section 3 |
| `q3_confidence` | new row in `questions` | multiple choice — see Section 3 |
| `q3b_next_step` | new row in `questions` | open text |
| `q4_not_helpful` | new row in `questions` | open text |
| `q5_engagement` | new row in `questions` | multiple choice — see Section 3 |
| `q5b_improvement` | new row in `questions` | open text |
| `unanswered_count` | `respondents.unanswered_count` | denormalized snapshot — see Section 5 |
| `unanswered_fields` | `respondents.unanswered_fields` | denormalized snapshot — see Section 5 |

Each of the 8 question columns (`q1_before_clarity` through `q5b_improvement`) becomes **one row in the `questions` table**, created once per client (not once per CSV row) — every respondent's answer to that question becomes a separate row in `responses`, linked back to that single question record.

---

## 3. Multiple Choice → Options Mapping

Three of the eight questions are multiple choice and require rows in the `options` table:

| Question | Options (in order) |
|---|---|
| `q1_before_clarity` / `q1b_after_clarity` | Not clear at all → A little clear → Somewhat clear → Very clear |
| `q3_confidence` | Not really → A little → Yes → Definitely |
| `q5_engagement` | Boring → Okay → Engaging → Very engaging |

`q1_before_clarity` and `q1b_after_clarity` are two **separate** question rows (before/after are distinct questions in the bank) but share the identical four-option set — each gets its own four `options` rows rather than sharing a single set, since options are scoped to a specific question, not reused across questions.

This yields **12 option rows total** (3 unique option-sets × 4 options each, applied across 4 multiple-choice questions — note `q1_before_clarity` and `q1b_after_clarity` each need their own copy of the clarity option set).

For a respondent's answer to a multiple-choice question, the corresponding `responses` row stores an `option_id` (foreign key into `options`), not raw text — this keeps aggregation/percentage calculations (used by the rule-based narrative engine) a straightforward `GROUP BY` rather than a text-matching operation.

Open text questions (`q2_most_helpful`, `q3b_next_step`, `q4_not_helpful`, `q5b_improvement`) have **no** `options` rows. Their `responses` rows store `answer_text` directly, with `option_id` left null.

---

## 4. Blank Field Handling

When a CSV cell is blank (participant skipped that question), a `responses` row is still inserted — with `option_id` null (multiple choice) or `answer_text` null/empty (open text) — rather than omitting the row entirely.

**Rationale:** this keeps every respondent's answer set uniform (one row per question per respondent, always), so completion-percentage queries, the completion tracker, and unanswered-field validation don't need to distinguish "row missing" from "row present but blank" — a blank `responses` row *is* the signal that the question was presented but not answered.

---

## 5. `unanswered_count` and `unanswered_fields` Mapping

Both fields map directly to `respondents` as **denormalized snapshot columns**, carried over as-is from the CSV at import time:

- `respondents.unanswered_count` — integer, as provided.
- `respondents.unanswered_fields` — stored as a delimited string or JSON array of the original field names (e.g., `q4_not_helpful, q5b_improvement`), as provided.

These values are also fully **derivable** at any time by querying `responses` for blank/null answers tied to a respondent — the denormalized columns exist for fast dashboard/completion-tracker rendering without a join, not because the data can't be recomputed. Phase 2 Builder should treat the CSV-provided values as the authoritative import values, with the option to validate them against a computed query as a data-integrity check during import.

---

## 6. Sample INSERT Order

Populated top-down, respecting foreign key dependencies:

1. **`programs`** — one row: "Understanding Yourself: A Framework for Change" (seeded once, reused across all clients — not present in the LIFT CSV, inserted manually as a fixed reference row).
2. **`clients`** — one row: "LIFT The Tri-State" (from `program` column), with `parent_organization` = "FreeStore Food Bank" (from `organization` column), and audience/category = "Job Seekers."
3. **`sessions`** — two rows, one per engagement: Session 1 (April 27, 2026) and Session 2 (June 15, 2026), each linked to the LIFT client and the program, `status = finalized` (historical, completed data).
4. **`questions`** — eight rows, scoped to the LIFT client, created once and reused across both sessions (same question set for both engagements): the 8 columns from `q1_before_clarity` through `q5b_improvement`, each tagged `multiple_choice` or `open_text`.
5. **`options`** — twelve rows: four options each for `q1_before_clarity`, `q1b_after_clarity`, `q3_confidence`, and `q5_engagement`.
6. **`respondents`** — 23 rows total (8 for Session 1 + 15 for Session 2), each linked to its session, carrying `response_id`, `role_type`, `unanswered_count`, `unanswered_fields`.
7. **`responses`** — 8 questions × 23 respondents = 184 rows, each linking a respondent to a question with either an `option_id` or `answer_text`.

This order is mandatory — each table depends on IDs generated by the one before it (programs → clients → sessions → questions → options → respondents → responses).

---

## 7. Multi-Client Proof Point — Helen Lewis Homes

A second client dataset, **Helen Lewis Homes** (`docs/HelenLewisHomes_Export.csv`, 4 respondents, 1 session, 23 columns), exists with a **different question structure** than LIFT's 8-question set.

This is the first real proof that the flexible question-bank schema functions as designed: importing Helen Lewis Homes requires **no structural changes** to any of the seven tables above. It requires only:
- A new `clients` row.
- A new `sessions` row linked to that client.
- A new set of `questions` rows (however many/whatever type Helen Lewis Homes' 23-column structure implies) scoped to that client.
- Corresponding `options` rows for any multiple-choice questions among them.
- `respondents` and `responses` rows following the same pattern as LIFT.

No new columns, no new tables, no schema migration — confirming the core architectural decision (Section 1 of `ARCHITECTURE-BRIEF.md`) holds under a genuinely different client question set, not just a second copy of LIFT's.
