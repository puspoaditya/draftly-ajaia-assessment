# Draftly

Draftly is a lightweight collaborative document editor built for the Ajaia AI-Native Full Stack Developer assessment. It focuses on a polished end-to-end slice: create and edit rich-text documents, import text files, persist work, and share documents between two demo users.

## Features

- Create, rename, edit, save, and reopen documents
- Rich text: bold, italic, underline, headings, bullet lists, and numbered lists
- Autosave with visible save state
- Import `.txt` and `.md` files (maximum 1 MB)
- Owner-only sharing controls
- Separate **Owned by me** and **Shared with me** views
- Persistent server-side JSON data store with atomic writes
- Responsive, accessible UI and clear error feedback

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs on `http://localhost:3001`.

For a production-style run:

```bash
npm run build
npm start
```

Open `http://localhost:3001`.

## Demo accounts

No password is required. Use the account switcher in the top-right corner.

| User | Email |
| --- | --- |
| Puspo Dwi Aditya | `puspo@demo.com` |
| Ajaia Reviewer | `reviewer@ajaia.com` |

To demonstrate sharing: create a document as Puspo, choose **Share**, grant access to `reviewer@ajaia.com`, return to the dashboard, switch users, and open it under **Shared with me**.

## Validation

```bash
npm run check
```

This runs the automated persistence/access test and the production build.

## Storage and deployment

Locally, data is written to `data/db.json` using an atomic temporary-file rename. In deployment, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to use the Supabase `documents` table defined in `supabase-schema.sql`. The service-role key is server-only and must never be prefixed with `VITE_` or exposed to the browser.

## Known scope limits

- Authentication is intentionally simulated with two seeded users.
- Shared users receive edit access; role-based permissions are not implemented.
- Markdown files are imported as safe plain text rather than rendered Markdown.
- The app does not provide real-time co-editing, comments, version history, or conflict resolution.
- This uses the browser editing API for a compact dependency footprint; a production version would use TipTap/Lexical and sanitize stored HTML server-side.

See [ARCHITECTURE.md](./ARCHITECTURE.md), [AI_WORKFLOW.md](./AI_WORKFLOW.md), and [SUBMISSION.md](./SUBMISSION.md) for evaluation context.
