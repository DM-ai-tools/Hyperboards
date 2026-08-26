# Hyperboards Frontpage Concept Trio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three visually distinct, standalone, responsive Hyperboards homepage prototypes for direct comparison without changing the approved live homepage.

**Architecture:** Each concept is an independent static mini-site with semantic HTML, a concept-specific token system in CSS, and dependency-free progressive-enhancement JavaScript. A Node structure test enforces shared claims, file boundaries, accessibility hooks, and visual differentiation; a Playwright script serves the folders locally and captures desktop/mobile evidence.

**Tech Stack:** HTML5, modern CSS (OKLCH, container queries, feature-gated scroll timelines), SVG, vanilla ES modules, Node test runner, Playwright, axe-core.

**Spec:** `docs/superpowers/specs/2026-08-27-frontpage-concept-trio-design.md`

## Global Constraints

- Do not modify any file under `src/` or the approved live homepage.
- Create exactly three standalone concept folders under `prototypes/frontpage-concepts/`.
- Every concept must contain its own `index.html`, `styles.css`, and `script.js` and must not depend on another concept folder.
- Publish only the approved `$750K–$2M` EBITDA and `$2M–$6M` typical deal-value ranges.
- State in the first viewport that Hyperboards is the buyer and not a broker, investment bank, or adviser.
- Keep investor language secondary and do not add unverified transaction-history, capital, timing, or outcome claims.
- Use semantic HTML, keyboard-operable controls, visible focus, responsive layouts, and reduced-motion fallbacks.
- Use transform/opacity/clip-path/SVG stroke motion; never animate layout dimensions.

---

### Task 1: Contract test and concept manifest

**Files:**
- Create: `tests/frontpage-concepts.test.mjs`
- Create: `prototypes/frontpage-concepts/README.md`

**Interfaces:**
- Consumes: shared factual and file contract from the design spec.
- Produces: automated assertions for folder structure, copy, semantics, isolation, motion fallbacks, and distinct concept tokens.

- [ ] **Step 1: Write the failing contract test**

Create a Node test that loads each expected folder, requires the three files, asserts the buyer role and approved ranges, checks the nine sectors, and rejects cross-concept imports, unsupported claims, gradient text, and thick side-stripe accents.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/frontpage-concepts.test.mjs`

Expected: FAIL because all three concept folders are absent.

- [ ] **Step 3: Add the concept README manifest**

Document the three philosophies, how to open each prototype, and the fact that they are design studies rather than live routes.

### Task 2: Monumental Ledger prototype

**Files:**
- Create: `prototypes/frontpage-concepts/01-monumental-ledger/index.html`
- Create: `prototypes/frontpage-concepts/01-monumental-ledger/styles.css`
- Create: `prototypes/frontpage-concepts/01-monumental-ledger/script.js`

**Interfaces:**
- Consumes: approved facts and the Task 1 file contract.
- Produces: standalone editorial concept with `data-concept="monumental-ledger"`, reveal hooks, and an acquisition-seal interaction.

- [ ] **Step 1: Implement semantic content and local anchors**

Build the page around owner intent, buyer role, mandate, operating principles, five-stage process, nine sectors, discreet investor note, and seller CTA.

- [ ] **Step 2: Implement the print-ledger visual system**

Use warm ivory, midnight navy, vermilion, asymmetric rules, folio numbers, editorial typography, and non-card composition.

- [ ] **Step 3: Implement progressive motion**

Add entrance registration, seal alignment, scroll reveals, header state, and reduced-motion behavior.

- [ ] **Step 4: Run the focused test**

Run: `node --test tests/frontpage-concepts.test.mjs`

Expected: only the two unimplemented concept cases remain failing.

### Task 3: Operator's Atlas prototype

**Files:**
- Create: `prototypes/frontpage-concepts/02-operators-atlas/index.html`
- Create: `prototypes/frontpage-concepts/02-operators-atlas/styles.css`
- Create: `prototypes/frontpage-concepts/02-operators-atlas/script.js`

**Interfaces:**
- Consumes: approved facts and the Task 1 file contract.
- Produces: standalone operational-map concept with `data-concept="operators-atlas"`, a keyboard-operable sector compass, and a process route.

- [ ] **Step 1: Implement semantic content and acquisition map**

Represent mandate, sectors, and process as an operating field map while retaining plain-text equivalents and owner CTAs.

- [ ] **Step 2: Implement the atlas visual system**

Use graphite, bone, mineral green, orange waypoints, coordinate fields, route geometry, and instrument-like typography without dashboard cards.

- [ ] **Step 3: Implement progressive interactions**

Add the sector compass, scroll route, pointer parallax, active navigation, and reduced-motion completed states.

- [ ] **Step 4: Run the focused test**

Run: `node --test tests/frontpage-concepts.test.mjs`

Expected: only the unimplemented Quiet Cinema case remains failing.

### Task 4: Quiet Cinema prototype

**Files:**
- Create: `prototypes/frontpage-concepts/03-quiet-cinema/index.html`
- Create: `prototypes/frontpage-concepts/03-quiet-cinema/styles.css`
- Create: `prototypes/frontpage-concepts/03-quiet-cinema/script.js`

**Interfaces:**
- Consumes: approved facts and the Task 1 file contract.
- Produces: standalone cinematic concept with `data-concept="quiet-cinema"`, an aperture hero, and keyboard-operable stewardship scenes.

- [ ] **Step 1: Implement the semantic narrative sequence**

Build the page as opening title, buyer declaration, mandate, stewardship scenes, sectors, process credits, investor footnote, and seller CTA.

- [ ] **Step 2: Implement the cinematic visual system**

Use oxblood-black, limestone, copper, ink blue, CSS/SVG silhouettes, scene cuts, and sculptural type without external imagery.

- [ ] **Step 3: Implement progressive interactions**

Add aperture reveal, pointer-responsive light plane, scene selector, scroll cuts, and reduced-motion static presentation.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/frontpage-concepts.test.mjs`

Expected: PASS for all concept contract tests.

### Task 5: Browser verification and evidence

**Files:**
- Create: `scripts/frontpage-concepts-qa.mjs`
- Create: `artifacts/frontpage-concepts/.gitkeep`
- Modify: `package.json`

**Interfaces:**
- Consumes: all three standalone concept folders.
- Produces: `qa:concepts` command, desktop/mobile screenshots, JSON QA report, and automated axe/overflow/console/keyboard checks.

- [ ] **Step 1: Write browser QA expectations**

Serve the repository from a loopback static server, open each concept at 1440×1000 and 390×844, verify its heading, direct-buyer copy, focusable CTA, no horizontal overflow, no console errors, and no serious/critical axe violations.

- [ ] **Step 2: Add the QA script and package command**

Add `"qa:concepts": "node scripts/frontpage-concepts-qa.mjs"` and implement screenshot/report output under `artifacts/frontpage-concepts/`.

- [ ] **Step 3: Run full verification**

Run: `npm test`

Run: `npm run check`

Run: `npm run qa:concepts`

Run: `npm run build`

Expected: all commands exit 0; screenshots exist for all six viewport/concept combinations; no source file under `src/` differs from the starting commit.

- [ ] **Step 4: Review screenshots at full resolution**

Inspect all desktop and mobile captures for hierarchy, contrast, visual uniqueness, clipping, and responsive composition. Correct any visual defects and rerun the complete verification set.
