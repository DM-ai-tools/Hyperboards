# Hyperboards premium showcase implementation plan

**Goal:** Deliver three distinct, complete acquisition websites alongside the supplied original, a discreet chooser, and a verified GitHub/Railway deployment.

**Authority:** User explicitly requests creative execution, three separate folders, combination with original, push to main and production deployment. Work in the named checkout; preserve the supplied original files. Design M means the menu; Design 1 the original; Designs 2–4 new directions. This resolves the otherwise five-label/four-site ambiguity without inventing a fourth new prototype.

**Architecture:** Existing Astro 7 Node server and inquiry endpoint. New static HTML/CSS/JS sites in `Hyper boards DEMO/design-2-atelier`, `design-3-meridian`, and `design-4-fieldwork`, recursively published under `public/showcase`. Each folder carries its own assets and works independently. Original seven root files are copied to `showcase/design-1-original`; original source stays intact. Chooser source `Hyper boards DEMO/choose-design.html`; root Astro route redirects to `/showcase/choose-design.html`.

## Content and functionality contract

Hyperboards buys established profitable businesses directly from owners. It is the prospective buyer, not an adviser, investment bank, or broker. Preserve target EBITDA $750K–$2M; typical deal value $2M–$6M; all nine sectors and their demand explanations; confidential introduction, initial fit, business review, terms/diligence; people/customer/continuity/context stewardship; five FAQ subjects. No invented transactions, metrics, clients, team members, performance, testimonials or financing promises. Ranges are guidelines rather than offers or valuations.

Each new folder contains `index.html`, `what-we-acquire.html`, `sell-your-business.html`, `styles.css`, `script.js`, and local assets. Match working mobile menu, anchor navigation, industry selection, FAQ disclosure, inquiry validation and API success/error states. Link privacy/terms to the existing deployed routes. Email: hello@hyperboards.com. Use readable copy, 44px controls, visible focus, reduced motion and content that survives JS failure. No false form confirmations. Chat remains an explicitly labelled preview if included.

## Task 1 — Atelier (independent)
- [x] Create all three pages in `design-2-atelier` using ivory, oxblood, sculptural architecture, Newsreader variable italic display and Instrument Sans body. Composition: asymmetric editorial hero, arched image, fine rules, serif statements and deliberate image cropping. Warm, discreet family-office mood.
- [x] Include contextual graphics, gentle 3D pointer response, progressive scroll reveals, acquisition exploration, full form and mobile styles.

## Task 2 — Meridian (independent)
- [x] Create all three pages in `design-3-meridian` using midnight graphite, silver, muted ice blue, large sans type, subtle ambient lighting and a signature custom sculptural bridge/orbital object. Cinematic precision with purposeful glass layers.
- [x] Include bounded motion/pause control, no perpetual work offscreen, acquisition exploration, full form and mobile styles.

## Task 3 — Fieldwork (independent)
- [x] Create all three pages in `design-4-fieldwork` using porcelain, cobalt, lime details, Swiss geometry and architectural imagery. Oversize graphic H/step motifs, asymmetric column rhythm and crisp informative typography. A confident contemporary operating partner.
- [x] Include dimensional hover graphics, scroll reveals, acquisition exploration, full form and mobile styles.

## Task 4 — Integration (parent)
- [x] Source licensed assets and local fonts. Build restrained chooser with true rendered thumbnails and accessible top-left expandable return control on every deployed page.
- [x] Add publish script with resolved destination guards. Preserve previous routes. Add Railway port 8080 build/start/health configuration.
- [x] Write browser QA covering desktop/tablet/mobile, all 12 routes, menu, FAQ, sector selection, links, keyboard and form outcomes via local mocks. Use screenshots and axe; run existing tests/build. Verify original source hashes remain unchanged.

## Task 5 — Review and deployment (parent)
- [x] Inspect all three heroes and lower sections, correct problems equally, review code and test evidence. Test file launch of each new prototype.
- [ ] Commit only intended files, push main using configured authentication; inspect Railway deployment status/logs, verify public chooser and pages. Inspect custom-domain DNS and preserve MX records.
- [ ] Record precise delivered paths, commit, production status and any actual unresolved blocker in `docs/premium-showcase-delivery.md`.

## Research / art direction

Primary references inspected 2026-09-11: https://linear.app/ (dark separation, product depth, disciplined hierarchy), https://www.kinfolk.com/ (image-led editorial rhythm and scale), https://www.generalatlantic.com/ (clear ownership/entrepreneur positioning), https://www.aesop.com/de/en/r/store-experience/ (architectural material identity), https://www.benchmarkintl.com/about/process/ (clarity of staged transaction explanation only). These inspire composition and navigation; no competitor copy/assets or track record is reused.

UI/UX Pro Max design-system searches returned luxury/dark/Swiss systems. Adopt Swiss spacing and dark contrast guidance; override generic Inter pairing and irrelevant Apple navigation recommendation with product-specific typography and layouts. Existing Astro version retained; local variable fonts avoid remote font/CSP dependencies.

## Progress ledger

Ruling: execute within the specified checkout on main — user explicitly names delivery folder and branch, and tracked working tree starts clean. Original template is untracked and must be included only as supplied content. No worktree required.
Ruling: parallel tasks own disjoint folders and never edit common infrastructure or commit. Parent owns assets/integration/deployment. All consume relative assets, same content/API contract and `../choose-design.html` return route.
Preflight: Tasks 1–3 share no files; they consume copies of parent font/photo assets. Task 4 consumes each complete folder and adds return control during publishing. Task 5 consumes test/build output. No interface conflict found.
