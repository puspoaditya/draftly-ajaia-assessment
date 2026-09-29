# Submission

## Included

- Full source code for the Draftly client and API
- `README.md` with setup, usage, demo accounts, and limitations
- `ARCHITECTURE.md` with scope, system design, and trade-offs
- `AI_WORKFLOW.md` describing practical AI usage and verification
- Automated test in `test/store.test.js`
- Render deployment blueprint in `render.yaml`
- `VIDEO_URL.txt` placeholder for the public walkthrough link

## Links

- Live product: **https://draftly-ajaia-assessment-woad.vercel.app**
- Source repository: **https://github.com/puspoaditya/draftly-ajaia-assessment**
- Walkthrough video: **https://youtu.be/4dtOgTFlVfY**
- Google Drive folder: **ADD GOOGLE DRIVE FOLDER URL HERE**

## Reviewer flow

1. Open the live product as **Puspo Dwi Aditya**.
2. Create a document and apply rich-text formatting.
3. Share it with `reviewer@ajaia.com`.
4. Return to the dashboard and switch to **Ajaia Reviewer**.
5. Open the document under **Shared with me**, edit it, and confirm it persists after refresh.
6. Import a `.txt` or `.md` file to see it become a new editable document.

## Status

Working: document lifecycle, formatting, autosave, reopen, validated text import, owner-controlled sharing, owned/shared separation, and server-side persistence.

Intentionally incomplete: real authentication, simultaneous real-time editing, comments, version history, revoke access, and view-only roles.

With another 2–4 hours: migrate to hosted Postgres, add authenticated sessions, introduce view/edit roles, and add browser-level end-to-end tests.
