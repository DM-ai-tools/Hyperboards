# Hyperboards — four website experiences

Open `choose-design.html` to explore the complete collection locally. Each site has a homepage, acquisition profile, and owner introduction page.

| Choice | Folder | Direction |
|---|---|---|
| Design M | choose-design.html | The design collection |
| Design 1 | design-1-original | Supplied reference, preserved |
| Design 2 | design-2-atelier | Ivory and oxblood editorial architecture |
| Design 3 | design-3-meridian | Midnight, silver sculpture and cinematic depth |
| Design 4 | design-4-fieldwork | Cobalt Swiss geometry and architectural optimism |

The seven original HTML/CSS/JS files directly in this directory are unchanged. `design-1-original` is the integrated copy with self-hosted fonts and the return control. The three new folders include all their page styles, scripts, fonts and graphics. The top-left edge control expands on hover or keyboard focus to return to the chooser, and remains touch accessible.

## Run with the server

From the parent `HYPERBOARDS WEBSITE` directory, use Node 22.19 or later:

```sh
npm ci
npm run build
npm start
```

Default port is 8080; Railway's PORT takes precedence. Open `http://localhost:8080/`. The Astro server preserves all existing business and legal routes and `/api/inquiries`. Direct file opening supports browsing and interactions; forms explain that delivery requires the deployed website.

## Validation and authoring

```sh
npm run sync:showcase
npm run capture:showcase
npm run qa:showcase
npm test
```

Capture and QA default to a running preview at `http://127.0.0.1:4321`; override `QA_BASE_URL` for a production build. Browser verification uses the installed Edge browser and local mock inquiry responses. No live inquiries are sent by the QA script. Source assets are published into `public/showcase` by `scripts/sync-premium-showcase.mjs`. QA artifacts and authoring Python files are excluded from publication.

Asset sources and font licenses are in `showcase-assets/ASSET-CREDITS.md` and each design's assets directory. Meridian includes a deterministic sculpture renderer as an authoring source. Shared contact details, criteria and API field values match the reference.

Online inquiry delivery uses the existing `INQUIRY_WEBHOOK_URL` and optional `INQUIRY_WEBHOOK_TOKEN` configuration. The pages only show success after the server confirms acceptance. `/api/health` identifies this release and reports whether a delivery URL is configured without exposing it.
