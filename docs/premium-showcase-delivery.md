# Hyperboards premium website collection

The collection contains the supplied original and three complete new websites. Design M is the selection page; Designs 1 through 4 are the four website experiences.

## Delivered source

Open `Hyper boards DEMO/choose-design.html` to browse the collection locally.

| Choice | Folder inside `Hyper boards DEMO` | Direction |
| --- | --- | --- |
| Design 1 | `design-1-original` | Integrated copy of the original reference |
| Design 2 | `design-2-atelier` | Ivory and oxblood, variable serif typography, architectural photography |
| Design 3 | `design-3-meridian` | Midnight and silver, custom sculptural links, atmospheric lighting |
| Design 4 | `design-4-fieldwork` | Cobalt and porcelain, dimensional graphic H, Swiss typography |

Each website contains a home page, acquisition-criteria page and owner-introduction page. The three new folders contain their own fonts, graphics, styles and scripts. A compact top-left control expands on hover or keyboard focus to return to the collection. The original seven supplied root files remain unchanged, verified against their SHA-256 baseline.

The main Astro route opens `/showcase/choose-design.html`. Previous `/designs` and `/design-previews` routes remain available. `npm run sync:showcase` publishes the editable source into `public/showcase`, excluding authoring and QA scripts.

## Behaviour and implementation

All four experiences retain the original nine acquisition sectors, financial guidelines, buyer positioning, process, FAQs and owner-introduction contract. Each new experience includes responsive navigation, keyboard controls, contextual sector selection, scroll reveals, dimensional pointer response, visible focus and reduced-motion handling. Meridian also offers a motion pause control. Content and navigation remain usable without JavaScript; Meridian's sector fallback also remains available when its script fails to load.

New graphics use lightweight local assets and CSS transforms. Fonts are self-hosted, including variable Instrument Sans and Newsreader. Photographic sources, font licences and custom-graphic authorship are recorded in each assets directory. No new framework or runtime dependency was added.

The existing `/api/inquiries` server contract is retained. Forms display success only after server acceptance, retain entered information on failure, and explain the unavailable-server case when opened directly as local files. Real delivery uses the existing Railway `INQUIRY_WEBHOOK_URL` configuration, with optional `INQUIRY_WEBHOOK_TOKEN`. These are private environment variables, not source files. No real inquiries were sent during verification.

## Validation

- Existing application suite: 49 tests passed.
- Production build: Astro check completed with zero errors, warnings or hints; production server starts on port 8080 and respects Railway's injected `PORT`.
- All 12 website pages checked at 390, 768 and 1440 pixels: 36 responsive checks with no horizontal overflow, broken images, JavaScript errors or serious/critical axe accessibility findings.
- Separate interaction checks cover the chooser at three widths, return-control focus, all nine sector selections per design, FAQ keyboard toggling, mobile menus, required fields, mocked service errors and successful submissions, direct file opening, and no-JavaScript navigation.
- Visual inspection covers the three home pages, both inner pages per design, mobile views and true rendered chooser thumbnails. Independent review identified one script-failure fallback issue; it was fixed and reverified with no open P1/P2 findings.

Reproduce with Node 22.19 or newer:

```sh
npm install
npm run build
npm start
# Run in another terminal; QA_BASE_URL defaults to the development server.
# Set QA_BASE_URL=http://127.0.0.1:8080 for the production build.
npm test
npm run qa:showcase
```

Local evidence is saved under `artifacts/premium-showcase/`; original hashes and build/test logs are also in `artifacts/`. This generated evidence is intentionally ignored by Git. The QA script intercepts inquiry requests locally instead of sending personal data.

## Research

Primary references inspected on 11 September 2026 include [Linear](https://linear.app/) for controlled depth and dark hierarchy, [Kinfolk](https://www.kinfolk.com/) for editorial scale and imagery, [General Atlantic](https://www.generalatlantic.com/) for entrepreneur-focused presentation, [Aesop](https://www.aesop.com/de/en/r/store-experience/) for architectural identity, and [Benchmark International](https://www.benchmarkintl.com/about/process/) for clear transaction stages. Their compositions informed distinct directions; competitor copy, proprietary assets and track records were not reused.

The requested UI/UX Pro Max and frontend-design skills informed art direction, contrast, spacing, typography, responsive structure and motion. Asset credits distinguish editorial architecture from any suggestion of actual Hyperboards portfolio holdings.

## Production configuration

- Repository: `DM-ai-tools/Hyperboards`, branch `main`.
- Railway project: `thriving-appreciation`; environment: `production`; service: `Hyperboards`.
- Build: `npm run build`; start: `npm start`; default port: 8080.
- Health route: `/api/health`, returning release marker `premium-showcase-2026-09-11`, design count, and whether inquiry delivery is configured. No secrets are exposed.
- Production URLs: https://hyperboards-production.up.railway.app/ and https://hyperboards.com/.

The existing GitHub-connected Railway pipeline deploys pushes to main. Public deployment evidence, the final commit and the production health response are recorded locally in `artifacts/premium-showcase/deployment.json` after release verification. DNS and MX/email records are preserved.

The initial collection release, commit `fce9764`, was successfully deployed to Railway production on 11 September 2026. Both public health endpoints returned HTTP 200 and the expected release marker; the custom domain opened the new four-design chooser. Production currently reports `inquiryDeliveryConfigured: false`: the website and form validation are available, but real owner-inquiry delivery requires the existing webhook integration to be configured. Forms report this honestly and retain entered details. The final follow-up adjusts the collapsed return control to a slim edge handle while preserving a 44px interactive area and full hover/focus reveal.
