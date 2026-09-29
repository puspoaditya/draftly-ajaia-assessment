# AI Workflow Note

## Tools used

I used OpenAI Codex as a coding partner for product scoping, implementation scaffolding, UI iteration, test creation, and documentation review.

## Where AI materially accelerated the work

- Converted the ambiguous brief into a bounded end-to-end product slice.
- Generated the initial React/Express structure and repetitive UI styling.
- Helped enumerate access-control and file-upload edge cases.
- Produced a first pass of the automated persistence test and submission documentation.

## What I changed or rejected

I kept authentication simulated rather than accepting an overbuilt auth proposal. I also rejected real-time collaboration as a poor timebox trade-off. Generated implementation details were reviewed for ownership enforcement, upload size/type validation, HTML escaping during import, save-state behavior, and deployment limitations. I simplified the storage layer to avoid requiring reviewer credentials or a paid dependency.

## Verification

I ran the automated test and production build together through `npm run check`. I manually exercised both seeded identities across create, format, autosave, refresh/reopen, import, share, and shared-document editing. I also checked responsive behavior at a narrow viewport and documented known limitations rather than presenting prototype choices as production-grade security.
