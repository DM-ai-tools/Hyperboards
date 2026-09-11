# Hyperboards Design Approver

The main website opens the finalized Evergreen template. The approver presents nine existing designs:

| Choice | Source folder or route |
|---|---|
| Design 1 — Evergreen Original | design-1-original |
| Design 2 — Corporate (earlier Meridian) | design-2-corporate |
| Design 3 — Monumental Ledger | design-3-monumental-ledger |
| Design 4 — Operators Atlas | design-4-operators-atlas |
| Design 5 — Quiet Cinema | design-5-quiet-cinema |
| Design 6 — Cobalt Standard | design-6-cobalt-standard |
| Design 7 — Blackline Office | design-7-blackline-office |
| Design 8 — Continuum House | design-8-continuum-house |
| Design 9 — Original Hyperboards | /design-content/hyperboards (Astro) |

Design 2 restores Design 3 from commit `756034c`, before the rejected changes. Designs 1 and 2 have home, acquisition and owner-introduction pages. Designs 3–8 are the existing homepage concepts, preserved from the listed prototype folders. Design 9 uses the original LeatherHomepage component.

From the parent repository, use Node 22.19 or later and run `npm run build`, then `npm run start:approver`. Open `http://localhost:8080/`. Standard `npm start` serves Evergreen at its homepage. Railway's injected PORT is respected.

The local `choose-design.html` can open the eight static designs directly; Design 9 requires the running Astro server. Hover or keyboard-focus the left-edge return control to return to the approver.

Source concepts and the seven original root files remain unchanged. The rejected three replacement folders have been removed. Font and image licenses accompany the supplied designs; the six archived concepts retain their existing external font references.

Run `npm run qa:showcase` against the approver and `npm test` against the standard app. Deployment configuration and evidence are described in `../docs/design-approver-release.md`.
