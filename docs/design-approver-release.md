# Evergreen production and Design Approver

The primary Hyperboards service returns to the finalized Evergreen homepage from commit `a84b34a`: `/design-previews/evergreen-partner-refined/index.html`. Its source is preserved in `prototypes/frontpage-concepts-v2/05-evergreen-partner-refined/`. DNS and email records are unchanged.

The separate Design Approver uses the same repository and build, with `node scripts/start-approver.mjs` as its start command. This sets `HYPERBOARDS_SITE_MODE=approver` at runtime, routing its homepage to `/showcase/choose-design.html`. Default `npm start` opens Evergreen. `/api/health` reports the active mode and release without exposing credentials.

## Collection

1. Evergreen Original — complete reference website.
2. Corporate — the earlier Design 3 (Meridian) restored from commit `756034c`, before the rejected replacement request; complete website.
3. Monumental Ledger — existing homepage concept.
4. Operators Atlas — existing homepage concept.
5. Quiet Cinema — existing homepage concept.
6. Cobalt Standard — existing homepage concept.
7. Blackline Office — existing homepage concept.
8. Continuum House — existing homepage concept.
9. Original Hyperboards — the existing `LeatherHomepage.astro` composition.

The user confirmed inclusion of all seven listed alternatives. The rejected Stewardship, Corporate replacement and Ledger folders were removed from the demo and published collection. Historical revisions remain recoverable through Git. Original concept source folders and the seven root Evergreen files are preserved.

## Railway

The separate service is prepared but has not been created: the user deferred Railway account changes and requested repository changes only while login is unavailable. Pushing this repository still updates the existing GitHub-connected Hyperboards service.

Keep the existing `Hyperboards` service and its domains on `railway.json` (`npm start`). Create a separate `Hyperboards-Design-Approver` service in the same production environment, connected to `DM-ai-tools/Hyperboards`, branch `main`, using config path `/railway.approver.json`. Generate a Railway service domain with target port 8080. Do not move `hyperboards.com` to the approver.

## Local use and verification

Use Node 22.19 or newer. Run `npm run build`, then `npm start` for Evergreen or `npm run start:approver` for the approver. Both default to port 8080; assign another `PORT` when running together. Design 9 is an Astro page and needs the running server. For development, set `HYPERBOARDS_SITE_MODE=approver` and run `npm run dev -- --port 4323`.

`npm run sync:showcase` publishes the eight static designs and chooser. `npm run capture:showcase` captures all nine actual rendered homepages. `npm run qa:showcase` verifies the complete collection; set `QA_BASE_URL` when using a port other than 4323. `npm test` verifies the application and default Evergreen routing. Evidence goes to `artifacts/approver-release/`.

Existing inquiry delivery requires `INQUIRY_WEBHOOK_URL`. The design-selection work does not configure delivery or send real inquiries. The six archived homepage concepts retain their original interactions and content; they are not represented as complete owner-acquisition websites.

## Verified repository delivery

- Final production build: 122 files checked, zero errors, warnings or hints.
- Application tests: 49 passed.
- Full collection browser QA: 63 checks passed, including 39 responsive page checks and three chooser layouts; no accessibility findings or real write requests.
- Built approver startup: 21 interaction checks passed.
- Both local startup modes: 78 route, content, health and rejected-design removal checks passed.
- All 13 restored Corporate files match commit `756034c` (normalizing text line endings). Original concepts, the LeatherHomepage component and all seven supplied Evergreen root files are unchanged.

Detailed local evidence is in `artifacts/approver-release/`. The existing GitHub-connected service can deploy this commit without a new browser login; creation of a separate approver service remains deferred.
