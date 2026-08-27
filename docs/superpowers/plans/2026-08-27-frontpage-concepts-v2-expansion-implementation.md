# Hyperboards Frontpage Concepts V2 Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine Evergreen Partner and add Blackline Office and Continuum House as isolated, accessible, production-quality Hyperboards homepage prototypes.

**Architecture:** Each concept owns an independent `index.html`, `styles.css`, and `script.js` namespace. Shared source-contract tests validate content, claims, isolation, and progressive-enhancement requirements; the existing Playwright/axe harness validates all four V2 concepts at desktop and mobile sizes.

**Tech Stack:** Semantic HTML, modern CSS, vanilla JavaScript, Node test runner, Playwright Core with Microsoft Edge, axe-core.

**Spec:** `docs/superpowers/specs/2026-08-27-frontpage-concepts-v2-expansion-design.md`

## Global Constraints

- Hyperboards is the direct prospective buyer, not an investment bank, broker, adviser, marketplace, or course provider.
- Target EBITDA is `$750K–$2M`; typical deal value is `$2M–$6M`.
- Primary CTA is `Discuss selling your business`; secondary CTA is `See what we acquire`.
- All nine approved target sectors must appear in each concept.
- Do not add completed-deal, AUM, permanent-capital, funding-guarantee, closing-speed, outcome, or indefinite-hold claims.
- Do not modify the approved Astro homepage, first-round prototypes, or `02-cobalt-standard`.
- Third-party JavaScript and owner-data forms are prohibited.
- Support 390px mobile and 1440px desktop, keyboard operation, WCAG 2.2 AA contrast, no-JS content, and reduced motion.

---

### Task 1: Expand the V2 Source Contracts

**Files:**
- Modify: `tests/frontpage-concepts-v2.test.mjs`
- Test: `tests/frontpage-concepts-v2.test.mjs`

**Interfaces:**
- Consumes: each concept folder's `index.html`, `styles.css`, and `script.js`.
- Produces: a four-entry `concepts` contract used by all V2 source tests.

- [ ] **Step 1: Add failing metadata for the new concepts and Evergreen refinements**

Extend `concepts` with:

```js
{
  folder: '03-blackline-office',
  id: 'blackline-office',
  palette: ['--blackline-carbon', '--blackline-paper', '--blackline-fog'],
  components: ['blackline-mandate', 'blackline-sector-matrix', 'blackline-process-track'],
},
{
  folder: '04-continuum-house',
  id: 'continuum-house',
  palette: ['--continuum-plum', '--continuum-mineral', '--continuum-signal'],
  components: ['continuum-path', 'continuum-lens', 'continuum-sector-orbit'],
},
```

Add `evergreen-section-index`, `evergreen-sector-ledger`, and `evergreen-process-line` to Evergreen's component list. Rename the namespace-isolation test to cover all concepts and compare every pair:

```js
for (let left = 0; left < classSets.length; left += 1) {
  for (let right = left + 1; right < classSets.length; right += 1) {
    const shared = [...classSets[left]].filter((name) => classSets[right].has(name));
    assert.ok(shared.length < 8, `${concepts[left].folder} and ${concepts[right].folder} share structural classes: ${shared.join(', ')}`);
  }
}
```

- [ ] **Step 2: Run the source tests and verify they fail for missing folders/hooks**

Run: `node --test tests/frontpage-concepts-v2.test.mjs`  
Expected: FAIL because Blackline and Continuum files and new Evergreen hooks do not exist.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add -- tests/frontpage-concepts-v2.test.mjs
git commit -m "test: define expanded frontpage concept contracts"
```

---

### Task 2: Refine Evergreen Partner

**Files:**
- Modify: `prototypes/frontpage-concepts-v2/01-evergreen-partner/index.html`
- Modify: `prototypes/frontpage-concepts-v2/01-evergreen-partner/styles.css`
- Modify: `prototypes/frontpage-concepts-v2/01-evergreen-partner/script.js`
- Test: `tests/frontpage-concepts-v2.test.mjs`

**Interfaces:**
- Consumes: the existing Evergreen document order and direct-buyer content.
- Produces: `[data-evergreen-index]`, `[data-evergreen-sector]`, and `[data-evergreen-process-line]` stateful interfaces.

- [ ] **Step 1: Add semantic refinement components**

Add a desktop section index with anchors for `top`, `role`, `profile`, `process`, and `questions`; enrich the hero dossier with a discreet status row; convert the sector list items into native buttons carrying `data-evergreen-sector` and `data-rationale`; add a live sector explanation with `aria-live="polite"`; and insert an inert process line carrying `data-evergreen-process-line`.

The sector explanation default must read:

```html
<p data-evergreen-sector-copy>Choose an industry to see why it may align with repeat-demand acquisition criteria.</p>
```

- [ ] **Step 2: Replace typography and deepen the visual system**

Use Literata and Schibsted Grotesk from Google Fonts. Convert core palette tokens to OKLCH, preserve evergreen/limestone/copper identity, and add tokens for layered paper depth, active rules, section-index states, and progress. Style the sector buttons, index, dossier status, and process line as restrained document furniture rather than cards.

- [ ] **Step 3: Implement stateful polish**

Use one `IntersectionObserver` to update the active section link with `aria-current="true"`, a second observer or the existing reveal observer to set process progress through a CSS custom property, and click handlers to set the selected sector button's `aria-pressed` state and update the live explanation. Preserve mobile-menu behavior and no-JS visibility.

- [ ] **Step 4: Run the Evergreen source contract**

Run: `node --test --test-name-pattern="01-evergreen-partner" tests/frontpage-concepts-v2.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit Evergreen**

```powershell
git add -- prototypes/frontpage-concepts-v2/01-evergreen-partner tests/frontpage-concepts-v2.test.mjs
git commit -m "polish: elevate evergreen partner concept"
```

---

### Task 3: Build Blackline Office

**Files:**
- Create: `prototypes/frontpage-concepts-v2/03-blackline-office/index.html`
- Create: `prototypes/frontpage-concepts-v2/03-blackline-office/styles.css`
- Create: `prototypes/frontpage-concepts-v2/03-blackline-office/script.js`
- Test: `tests/frontpage-concepts-v2.test.mjs`

**Interfaces:**
- Consumes: shared content contract and nine-sector list.
- Produces: `[data-blackline-menu]`, `[data-blackline-nav]`, `[data-blackline-index]`, `[data-blackline-mandate-tab]`, and `[data-blackline-sector]` interfaces.

- [ ] **Step 1: Create the semantic document**

Build one `h1` reading `The buyer is already at the table.` The first viewport must contain the explicit direct-buyer statement, both financial ranges, and both required CTAs. Include sections for role, mandate, sectors, process, stewardship, FAQ, CTA, and footer. Use buttons with `aria-selected` inside a `tablist` for the four mandate views, native buttons for sector focus, native `details` for FAQs, and a mobile navigation button.

- [ ] **Step 2: Implement the monochrome visual system**

Use Archivo and Public Sans. Define `--blackline-carbon`, `--blackline-paper`, and `--blackline-fog` as near-black and tinted-white OKLCH tokens. Build a twelve-column Swiss layout with alternating carbon/paper fields, decisive rules, an anchored section index, an asymmetric hero, and a horizontal process track. Do not use gradients, glass, rounded-card grids, or chromatic accents.

- [ ] **Step 3: Implement purposeful interaction and motion**

Implement keyboard-safe mobile navigation, mandate tabs with arrow-key navigation and `aria-selected`, sector focus with `aria-pressed`, active section-index tracking, FAQ single-open behavior, and staggered reveal classes. Use transform/opacity only for major motion. Disable pointer parallax for coarse pointers and all coordinated motion for `prefers-reduced-motion`.

- [ ] **Step 4: Run the Blackline source contract**

Run: `node --test --test-name-pattern="03-blackline-office" tests/frontpage-concepts-v2.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit Blackline**

```powershell
git add -- prototypes/frontpage-concepts-v2/03-blackline-office tests/frontpage-concepts-v2.test.mjs
git commit -m "feat: add blackline office concept"
```

---

### Task 4: Build Continuum House

**Files:**
- Create: `prototypes/frontpage-concepts-v2/04-continuum-house/index.html`
- Create: `prototypes/frontpage-concepts-v2/04-continuum-house/styles.css`
- Create: `prototypes/frontpage-concepts-v2/04-continuum-house/script.js`
- Test: `tests/frontpage-concepts-v2.test.mjs`

**Interfaces:**
- Consumes: shared content contract and nine-sector list.
- Produces: `[data-continuum-menu]`, `[data-continuum-nav]`, `[data-continuum-path]`, `[data-continuum-lens-button]`, and `[data-continuum-sector]` interfaces.

- [ ] **Step 1: Create the semantic document**

Build one `h1` reading `Ownership, carried forward.` Keep the hero proposition and acquisition profile visible in the desktop first viewport. Include sections for buyer role, criteria lens, sector orbit/list, process, stewardship, FAQ, CTA, and footer. Use native buttons for lens and sector controls, an `aria-live="polite"` explanation, native `details`, and a mobile navigation button.

- [ ] **Step 2: Implement the original visual system**

Use Geologica and Noto Sans. Define `--continuum-plum`, `--continuum-mineral`, and `--continuum-signal` in OKLCH. Build an offset composition of mineral planes on smoked plum with rare vermilion signals. Connect sections with a single SVG/CSS ownership path and precise topographic linework. Avoid neon, blue-purple gradients, glow, glass, and conventional equal-card grids.

- [ ] **Step 3: Implement the narrative interaction**

Use section observers to update path progress and the active path node, criteria-lens buttons to update `aria-pressed` and the adjacent explanation, sector controls to reveal demand context, and a single coordinated reveal pattern. The path must be complete and all content visible with JavaScript disabled or reduced motion enabled.

- [ ] **Step 4: Run the Continuum source contract**

Run: `node --test --test-name-pattern="04-continuum-house" tests/frontpage-concepts-v2.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit Continuum**

```powershell
git add -- prototypes/frontpage-concepts-v2/04-continuum-house tests/frontpage-concepts-v2.test.mjs
git commit -m "feat: add continuum house concept"
```

---

### Task 5: Extend Browser QA and Complete Visual Verification

**Files:**
- Modify: `scripts/frontpage-concepts-v2-qa.mjs`
- Modify: `artifacts/frontpage-concepts-v2/report.json`
- Create: `artifacts/frontpage-concepts-v2/blackline-office-desktop.png`
- Create: `artifacts/frontpage-concepts-v2/blackline-office-mobile.png`
- Create: `artifacts/frontpage-concepts-v2/continuum-house-desktop.png`
- Create: `artifacts/frontpage-concepts-v2/continuum-house-mobile.png`
- Modify: existing Evergreen screenshots in `artifacts/frontpage-concepts-v2/`

**Interfaces:**
- Consumes: concept metadata selectors and all four isolated prototype folders.
- Produces: source, browser, accessibility, reduced-motion, and screenshot evidence for four concepts across two viewports.

- [ ] **Step 1: Add failing browser metadata**

Add Blackline and Continuum entries with exact route, name, H1 substring, menu, nav, reveal, and first-viewport criteria selectors. Change any two-concept report wording to derive from `concepts.length`.

- [ ] **Step 2: Run browser QA and inspect failures**

Run: `npm run qa:concepts:v2`  
Expected before final fixes: any selector, accessibility, overflow, or interaction mismatch is reported with its concept and viewport.

- [ ] **Step 3: Add concept-specific interaction checks**

For Evergreen, activate the second sector button and verify its `aria-pressed` state and explanation change. For Blackline, activate the second mandate tab and verify `aria-selected` plus panel content. For Continuum, activate the second lens button and verify `aria-pressed` plus explanation change. Record each result in `report.interactions`.

- [ ] **Step 4: Run all verification commands**

Run:

```powershell
npm test
npm run qa:concepts:v2
npm run build
git diff --check
```

Expected: all tests pass; browser QA reports four concepts, two viewports, and eight full-page screenshots; Astro reports zero errors, warnings, and hints; `git diff --check` prints nothing.

- [ ] **Step 5: Inspect full-page screenshots**

Open all updated desktop and mobile images. Verify visible first-viewport buyer clarity, typography rendering, section continuity, no clipping, no unintended overlap, coherent responsive adaptation, and clear visual distinction between the three target systems. Correct and rerun QA if any defect is visible.

- [ ] **Step 6: Commit the QA-complete expansion**

```powershell
git add -- scripts/frontpage-concepts-v2-qa.mjs artifacts/frontpage-concepts-v2 prototypes/frontpage-concepts-v2 tests/frontpage-concepts-v2.test.mjs
git commit -m "test: verify expanded frontpage concept suite"
```

