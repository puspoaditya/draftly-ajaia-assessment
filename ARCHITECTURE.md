# Architecture Note

## Product slice

I prioritized the smallest coherent collaborative-document workflow: create → edit → autosave → reopen → share → switch user → access. Every mandatory capability is visible in that flow without requiring reviewers to create accounts or configure an external service.

## Structure

- **React + Vite client:** dashboard, account switcher, rich-text editing, file import, sharing modal, and save-state feedback.
- **Express API:** access checks, document operations, upload validation, and static production hosting.
- **File-backed store:** users and documents live in one JSON file. Writes use a temporary file and rename to reduce corruption risk.
- **Data model:** each document has one `ownerId` and a `sharedWith` list. Both owners and recipients may edit; only owners may grant access.

The client sends the selected seeded user in `x-user-id`. This is intentionally not presented as real authentication—it makes access behavior easy to evaluate within the timebox.

## Key trade-offs

I chose a dependency-light browser editor instead of building real-time collaboration or integrating a large editor framework. This allowed attention to go toward a complete workflow, access enforcement, autosave feedback, responsive polish, and evaluation documentation.

The local file store makes setup deterministic and free. It is appropriate for a single-instance assessment, but not horizontally scalable. In production I would use Postgres, authenticated sessions, transactions, sanitized rich-text JSON, and optimistic concurrency/version checks.

## With another 2–4 hours

1. Replace simulated identity with passwordless authentication.
2. Move persistence to Postgres and add database migrations.
3. Use TipTap with server-side HTML sanitization.
4. Add view/edit roles and revoke access.
5. Add Playwright coverage for the full sharing journey.
