# Hyperboards Professional Frontpage Duo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two standalone, production-ready Hyperboards homepage prototypes for a professional design comparison without modifying the approved Astro homepage.

**Architecture:** Add a new isolated prototype root containing two self-contained HTML/CSS/JavaScript pages. Extend the existing Node source-contract test and browser-QA pattern with a dedicated v2 contract and runner so the new pages can be tested independently from the first-round concepts.

**Tech Stack:** Semantic HTML5, modern CSS, dependency-free browser JavaScript, Node test runner, Playwright Core, axe-core.

**Spec:** `docs/superpowers/specs/2026-08-27-professional-frontpage-duo-design.md`

## Global Constraints

- Keep `src/pages/index.astro` and `prototypes/frontpage-concepts/` unchanged.
- Hyperboards is the direct prospective buyer, not an investment bank, broker, adviser, marketplace, or course provider.
- Publish only the `$750K–$2M` target EBITDA and `$2M–$6M` typical deal-value guidelines.
- Include all nine approved sectors and no unsupported track-record, capital, speed, outcome, or hold-period claims.
- Use plain HTML, CSS, and dependency-free JavaScript with progressive enhancement.
- Pass WCAG AA-oriented keyboard, focus, contrast, reduced-motion, overflow, and axe checks.

---

## File map

- `prototypes/frontpage-concepts-v2/README.md` — comparison guide and reference rationale.
- `prototypes/frontpage-concepts-v2/01-evergreen-partner/index.html` — Evergreen semantic content and section flow.
- `prototypes/frontpage-concepts-v2/01-evergreen-partner/styles.css` — Evergreen token system and responsive visual implementation.
- `prototypes/frontpage-concepts-v2/01-evergreen-partner/script.js` — enhancement-only navigation, header, reveal, and year behavior.
- `prototypes/frontpage-concepts-v2/02-cobalt-standard/index.html` — Cobalt semantic content and section flow.
- `prototypes/frontpage-concepts-v2/02-cobalt-standard/styles.css` — Cobalt token system and responsive visual implementation.
- `prototypes/frontpage-concepts-v2/02-cobalt-standard/script.js` — enhancement-only navigation, header, reveal, and year behavior.
- `tests/frontpage-concepts-v2.test.mjs` — content, structure, isolation, claim, design-token, and progressive-enhancement contracts.
- `scripts/frontpage-concepts-v2-qa.mjs` — responsive browser, keyboard, reduced-motion, axe, console, and screenshot verification.
- `package.json` — add `qa:concepts:v2`.

---

### Task 1: Define the v2 source contract

**Files:**
- Create: `tests/frontpage-concepts-v2.test.mjs`
- Create: `prototypes/frontpage-concepts-v2/README.md`

**Interfaces:**
- Consumes: the shared facts and restrictions in the design spec.
- Produces: tests that load `index.html`, `styles.css`, and `script.js` from each concept folder and fail until both prototypes exist.

- [ ] **Step 1: Write the failing source-contract test**

Create a Node test describing both concepts, required facts, nine sectors, forbidden claims, required token names, semantic landmarks, skip link, reduced-motion contract, and prohibited first-round signatures.

```js
const concepts = [
  { folder: '01-evergreen-partner', id: 'evergreen-partner', tokens: ['--evergreen-900', '--limestone-100', '--copper-600'] },
  { folder: '02-cobalt-standard', id: 'cobalt-standard', tokens: ['--cobalt-700', '--porcelain-50', '--terracotta-600'] },
];
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/frontpage-concepts-v2.test.mjs`

Expected: FAIL with `ENOENT` because the two prototype folders do not exist.

- [ ] **Step 3: Add the comparison README**

Document that both concepts share the same facts, that they are independent from the approved site and first-round concepts, and that official reference sites informed structure without being copied.

- [ ] **Step 4: Commit the red contract**

```powershell
git add tests/frontpage-concepts-v2.test.mjs prototypes/frontpage-concepts-v2/README.md
git commit -m "test: define professional frontpage duo contract"
```

### Task 2: Implement Evergreen Partner

**Files:**
- Create: `prototypes/frontpage-concepts-v2/01-evergreen-partner/index.html`
- Create: `prototypes/frontpage-concepts-v2/01-evergreen-partner/styles.css`
- Create: `prototypes/frontpage-concepts-v2/01-evergreen-partner/script.js`

**Interfaces:**
- Consumes: source-contract expectations for `data-concept="evergreen-partner"`, approved facts, sectors, tokens, semantic structure, and progressive enhancement.
- Produces: a directly openable homepage with anchor IDs `top`, `role`, `profile`, `process`, `questions`, and `contact`.

- [ ] **Step 1: Add the semantic Evergreen document**

Use one `h1`, a skip link, direct-buyer hero, acquisition register, role statement, owner principles, acquisition profile, nine-sector index, four-stage process, stewardship section, native FAQ disclosures, CTA, and footer.

- [ ] **Step 2: Add the Evergreen token and layout system**

Define primitive, semantic, and component variables. Implement one max-width grid, warm limestone fields, evergreen typography, copper accents, responsive navigation, visible focus, and no card wall or ornamental graphic.

- [ ] **Step 3: Add enhancement-only behavior**

Implement mobile-menu `aria-expanded`, compact-header state, IntersectionObserver reveal class, and current year. Feature-detect every optional API and expose content by default when unsupported or reduced motion is requested.

- [ ] **Step 4: Run the source contract**

Run: `node --test tests/frontpage-concepts-v2.test.mjs`

Expected: Evergreen assertions pass; Cobalt still fails with `ENOENT`.

- [ ] **Step 5: Commit Evergreen**

```powershell
git add prototypes/frontpage-concepts-v2/01-evergreen-partner
git commit -m "feat: add evergreen partner homepage concept"
```

### Task 3: Implement Cobalt Standard

**Files:**
- Create: `prototypes/frontpage-concepts-v2/02-cobalt-standard/index.html`
- Create: `prototypes/frontpage-concepts-v2/02-cobalt-standard/styles.css`
- Create: `prototypes/frontpage-concepts-v2/02-cobalt-standard/script.js`

**Interfaces:**
- Consumes: source-contract expectations for `data-concept="cobalt-standard"`, approved facts, sectors, tokens, semantic structure, and progressive enhancement.
- Produces: a directly openable homepage with the same owner journey but an independent class namespace and corporate visual system.

- [ ] **Step 1: Add the semantic Cobalt document**

Use one `h1`, a skip link, direct-buyer hero, compact criteria rail, buyer-role statement, owner commitments, acquisition profile, orderly sector index, numbered process, stewardship section, native FAQ disclosures, CTA, and footer.

- [ ] **Step 2: Add the Cobalt token and layout system**

Define a separate primitive/semantic/component variable set. Implement cobalt and porcelain color fields, graphite type, a restrained terracotta CTA, structured eight-column sections, and a simple code-native operating field whose labels describe real acquisition criteria rather than fabricated data.

- [ ] **Step 3: Add enhancement-only behavior**

Implement the same behavior contract through Cobalt-specific hooks without sharing source files or global class names.

- [ ] **Step 4: Run the source contract and verify GREEN**

Run: `node --test tests/frontpage-concepts-v2.test.mjs`

Expected: all v2 source-contract tests pass.

- [ ] **Step 5: Commit Cobalt**

```powershell
git add prototypes/frontpage-concepts-v2/02-cobalt-standard
git commit -m "feat: add cobalt standard homepage concept"
```

### Task 4: Add responsive browser QA

**Files:**
- Create: `scripts/frontpage-concepts-v2-qa.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: the two local prototype routes, expected H1 fragments, menu buttons, FAQ summaries, and reduced-motion selectors.
- Produces: `artifacts/frontpage-concepts-v2/report.json` plus four full-page screenshots.

- [ ] **Step 1: Write the browser runner contract**

Serve repository files on `127.0.0.1:4412`; verify both concepts at 1440×1000 and 390×844. Assert HTTP 200, one H1, direct-buyer copy, no horizontal overflow, skip-link-first keyboard order, mobile navigation state, native FAQ keyboard activation, serious/critical axe count zero, console/page-error count zero, and reduced-motion visibility.

- [ ] **Step 2: Add the package command**

```json
"qa:concepts:v2": "node scripts/frontpage-concepts-v2-qa.mjs"
```

- [ ] **Step 3: Run browser QA and fix only evidenced defects**

Run: `npm run qa:concepts:v2`

Expected: `Concept v2 browser QA passed: 2 concepts, 2 viewports, 4 full-page screenshots.`

- [ ] **Step 4: Commit QA integration**

```powershell
git add scripts/frontpage-concepts-v2-qa.mjs package.json
git commit -m "test: add browser QA for frontpage duo"
```

### Task 5: Final visual, accessibility, and repository verification

**Files:**
- Modify only files with defects demonstrated by verification.

**Interfaces:**
- Consumes: source tests, browser report, screenshots, build output, and the design spec.
- Produces: a verified comparison ready for user evaluation.

- [ ] **Step 1: Inspect all four screenshots**

Review desktop and mobile outputs for section continuity, hierarchy, typography, consistent alignment, wrapping, control states, and accidental decoration. Confirm the two concepts are visually distinct and neither resembles the first-round art exercises.

- [ ] **Step 2: Run the complete verification suite**

```powershell
npm test
npm run qa:concepts:v2
npm run build
git diff --check
```

Expected: all tests pass; browser QA reports four screenshots and zero failures; Astro check/build exits zero; `git diff --check` is silent.

- [ ] **Step 3: Audit protected files**

```powershell
git diff 07804a1 -- src/pages/index.astro prototypes/frontpage-concepts
```

Expected: no diff for the approved homepage or first-round concept folders.

- [ ] **Step 4: Commit any verified polish fixes**

```powershell
git add prototypes/frontpage-concepts-v2 tests/frontpage-concepts-v2.test.mjs scripts/frontpage-concepts-v2-qa.mjs package.json
git commit -m "polish: finalize professional frontpage duo"
```
