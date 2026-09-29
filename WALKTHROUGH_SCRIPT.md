# 3–5 Minute Walkthrough Script

## 0:00–0:30 — Context

“This is Draftly, a lightweight collaborative document editor. I scoped the assignment around one complete workflow rather than trying to reproduce all of Google Docs.”

## 0:30–1:35 — Create and edit

Create a document, rename it, type content, and demonstrate bold, italic, underline, a heading, and a list. Point out the autosave state. Return to the dashboard and reopen the document.

## 1:35–2:10 — File import

Import a small `.txt` or `.md` file. Explain that the UI clearly limits imports to those formats and 1 MB, and that imported content is safely escaped before becoming editable.

## 2:10–3:00 — Sharing

Open a document as Puspo and share it with `reviewer@ajaia.com`. Return to the dashboard, switch to Ajaia Reviewer, show it under **Shared with me**, edit it, refresh, and confirm persistence.

## 3:00–3:40 — Architecture and trade-offs

Explain the React/Vite frontend, Express API, file-backed persistence, and server-side access checks. Mention that seeded identities remove review friction but are deliberately not production authentication. Note that real-time collaboration, comments, and permission roles were deprioritized.

## 3:40–4:20 — AI workflow

Explain that Codex accelerated scaffolding, styling, edge-case review, tests, and documentation. Mention that generated ideas for full authentication and real-time collaboration were rejected to preserve the timebox, and that correctness was checked with the automated test, production build, and manual end-to-end flow.
