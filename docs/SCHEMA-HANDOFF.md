# Schema Handoff — Multi-Client Data Aggregation & Display Platform
### Practical Reference for the Developer
**Owner:** Documentation Agent (Agent 8)
**Trigger:** PM Radar row 38 — seven tables confirmed live on server via `knex migrate:latest`
**Date:** 2026-08-03
**Audience:** Developer, not a technical team — this is a working reference, not a spec document

---

## 1. What Each Table Does and Why It Exists

The schema is built around one idea: **questions and their options are data, not structure.** Nothing about a new client, a new engagement, or a new question requires a schema change — you insert rows, you never alter tables. That's the whole point of the flexible question-bank design (Decisions Log, 2026-07-12).

| Table | What it holds | Why it exists |
|---|---|---|
| **clients** | One row per client organization — LIFT The Tri-State, Helen Lewis Homes, etc. | The top-level container. Everything else eventually traces back to a client. |
| **programs** | One row per program offered — e.g. *Understanding Yourself: A Framework for Change*. **Standalone, global — no `client_id`.** | Programs aren't owned by a client. The same program can be delivered to multiple clients. Keeping it global avoids duplicating the program definition every time it's delivered somewhere new. |
| **sessions** | One row per actual engagement/delivery — a specific date a program was run for a specific client. Carries both `client_id` and `program_id`. | This is the join point. It's where "this program" and "this client" actually meet, on a specific date (`session_date` — never `date`, see Section 5). |
| **questions** | One row per question asked. Scoped to a **client**, not a session. | Scoping to the client (not the session) means the same question set can be reused across multiple sessions for that client without re-entering it every time. |
| **options** | One row per answer choice for a given question (multiple-choice questions only). | Lets a question have any number of choices without needing separate columns per choice — new choices are just new rows. |
| **respondents** | One row per person who submitted feedback in a session. Carries `response_id` (integer). | This is the anonymous participant record — no PII, per the 2026-07-12 decision. `response_id` is what ties a person's answers together without identifying who they are. |
| **responses** | One row per individual answer. Connects back to a session **indirectly, through respondents** — not directly. | This is where the actual feedback data lives — one row per question answered by one respondent. |

**The chain, top to bottom:**
```
clients ──┐
          ├──> sessions <── programs (global, no client_id)
          │        │
          │        └──> respondents ──> responses
          │
          └──> questions ──> options
```

Questions belong to a client (reusable across that client's sessions). Responses belong to a respondent, who belongs to a session. This was implicit in `LIFT-DATA-MAPPING.md` and has since been made explicit in both that document and `ARCHITECTURE-BRIEF.md` (Decisions Log, 2026-07-27).

---

## 2. Onboarding a New Client — What Rows to Add, In What Order

Order matters because of foreign key dependencies. Insert in this sequence:

1. **`clients`** — one row for the new organization (name, any contact/reference info you're tracking)
2. **`programs`** — only if this is a genuinely new program. If it's *Understanding Yourself: A Framework for Change* again, skip this — the program row already exists and is reused.
3. **`sessions`** — one row per actual engagement delivered, referencing the new `client_id` and the (new or existing) `program_id`, with the real `session_date`
4. **`questions`** — the question set for this client. If it's the same question set used elsewhere, you're still inserting new rows scoped to this client's `client_id` — questions aren't shared across clients, even if the wording is identical
5. **`options`** — the answer choices for any multiple-choice questions just inserted
6. **`respondents`** and **`responses`** — added as actual feedback comes in (manually via the admin grid, or via CSV import once that feature is live)

**Rule of thumb:** `clients` → `programs` (if new) → `sessions` → `questions` → `options` → then respondents/responses as real data arrives.

---

## 3. Adding a New Question Set for an Existing Client

You don't need a new session to add questions — questions are scoped to the **client**, not the session.

1. Insert new rows into `questions`, referencing the existing `client_id`
2. If any are multiple-choice, insert the corresponding rows into `options`, referencing the new `question_id`
3. That's it — no schema change, no migration. The new questions are immediately available to any current or future session for that client.

If you're adding questions for a **new session** with the **same client**, you have two choices: reuse existing `questions` rows (just create a new `sessions` row and start collecting `respondents`/`responses` against it), or add new question rows if the question set for this particular engagement differs from prior ones.

---

## 4. Adding New Options to an Existing Question

This is the simplest, most common change you'll make.

1. Find the `question_id` of the question you're adding a choice to
2. Insert a new row into `options` referencing that `question_id`
3. Done — no migration, no downtime, no code change. The dashboard renders whatever options exist for a question, so a new row just shows up.

This is exactly the scenario the flexible schema was built to make trivial (Decisions Log, 2026-07-12) — "we forgot an option" or "the client wants to add a choice" should never require touching a migration file.

---

## 5. How `response_id`, `unanswered_count`, and `unanswered_fields` Work in Practice

- **`response_id`** lives on `respondents` and is typed as a plain **integer** (Decisions Log, 2026-07-27) — this matches how the source LIFT CSV data actually looked (`1`, `2`, `3`...), and integers sort and filter more cleanly than strings. Think of it as "respondent #4 in session X" — it's a sequence number scoped to identifying which set of answers belong together, not a personal identifier.
- **`unanswered_count`** and **`unanswered_fields`** track incomplete submissions. Every question on the feedback form is skippable by design (per the original LIFT app planning). When a respondent submits, the system counts how many questions they left blank (`unanswered_count`) and records *which* questions those were (`unanswered_fields`) — this is what lets the dashboard show completion-rate stats without guessing, and lets QA/reporting distinguish "answered 'no comment'" from "skipped entirely."
- **In practice:** when you're looking at a `respondents` row and wondering why the response looks incomplete, check `unanswered_count` first (quick signal of how much is missing) and `unanswered_fields` second (exactly which questions to follow up on or exclude from a completion-rate calculation).

---

## 6. `platform_migrator` vs `platform_app` — When to Use Each

Two separate MySQL users exist on purpose, following the principle of least privilege (Decisions Log, 2026-08-03):

| User | Privileges | Used for | Used by |
|---|---|---|---|
| **`platform_app`** | `SELECT`, `INSERT`, `UPDATE`, `DELETE` only | All normal runtime queries — the Node/Express API connecting to MySQL during everyday operation | The application itself, automatically, every time it runs |
| **`platform_migrator`** | `CREATE`, `ALTER`, `DROP`, `INDEX`, `REFERENCES` (schema modification rights) | Running `knex migrate:latest` — creating or changing tables | **You, manually, via RDP, only when running a migration** |

**In practice:**
- If you're running the app normally (dashboard, admin grid, API serving requests) — that's `platform_app`, and you never touch this directly; it's already wired into the server `.env` file.
- If you're running a schema migration (`knex migrate:latest`) — that's `platform_migrator`, and you invoke it explicitly via environment variable override at the terminal:
  ```
  $env:DB_USER='platform_migrator'; $env:DB_PASSWORD='[from password manager]'; npx knex migrate:latest
  ```
  Credentials are typed at the terminal, never written to any file, and never pasted into chat (see Security Reminder below).

**The rule that matters:** if a migration ever fails with a permissions error mentioning `CREATE`, `ALTER`, or `REFERENCES`, the first thing to check is whether you're accidentally running it as `platform_app` instead of `platform_migrator`. This exact gap (missing `REFERENCES` privilege for foreign keys) already happened once and is logged in the Decisions Log, 2026-08-03.

---

## 7. Worked Example — LIFT The Tri-State

Walking the actual chain end to end, using the real first client:

1. **`clients`** — one row: LIFT The Tri-State (workforce development program, FreeStore Food Bank, Cincinnati OH)
2. **`programs`** — one row: *Understanding Yourself: A Framework for Change* (global — not tied to LIFT specifically, since the consulting practice can deliver this same program to other clients too)
3. **`sessions`** — two rows so far, each referencing LIFT's `client_id` and the program's `program_id`, with the actual `session_date` for each delivered engagement
4. **`questions`** — the LIFT feedback question set, scoped to LIFT's `client_id`, mapped from the original 17-column CSV per `LIFT-DATA-MAPPING.md` (committed 2026-07-25)
5. **`options`** — the multiple-choice answer sets for any of those LIFT questions that aren't open-text
6. **`respondents`** — one row per person who gave feedback in each of the two sessions, each with an integer `response_id` scoped to that session
7. **`responses`** — one row per answer each respondent gave, connecting back to their `respondents` row (and from there, indirectly, to the session)

**Multi-client proof point:** Helen Lewis Homes (`HelenLewisHomes_Export.csv`, PM Radar row 27) has a genuinely **different question structure** than LIFT — different questions, different shape. That dataset is the first real test that this schema handles two clients with completely different feedback forms correctly, without any schema change between them. It's staged and ready for import once the CSV import feature (Phase 2 scope) is live.

---

## Security Reminder

Per PM instruction: before pasting any terminal output from an RDP session back into chat, review it line by line for credential values. PowerShell and MySQL can echo passwords in output (for example, in a command history, an error message, or a connection string). **Never paste output containing a password into any chat message.** If a credential value is ever accidentally exposed in chat, per the Credential Detection Safety Protocol (Decisions Log, 2026-08-03), stop immediately, don't repeat or act on the value, and route to PM for exposure assessment.

---

*This document is a practical reference, not a replacement for `LIFT-DATA-MAPPING.md` or `ARCHITECTURE-BRIEF.md` — those remain the authoritative schema-design documents. This one exists so day-to-day onboarding and data-entry tasks don't require re-reading either.*
