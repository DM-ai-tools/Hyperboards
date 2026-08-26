# Atelier Casework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved Atelier Casework material system across the existing Hyperboards site while preserving its content, functionality, accessibility, and performance.

**Architecture:** Add two lightweight local SVG textures and one decorative Astro frame component, then express the material system through shared CSS tokens and focused component styles. Existing page structures and data remain authoritative; styling changes are made at reusable component boundaries so all routes inherit a consistent treatment.

**Tech Stack:** Astro 7.2.4, TypeScript, scoped Astro CSS, shared CSS custom properties, local SVG assets, Node 22.19, Playwright/Edge, axe-core.

**Spec:** `docs/superpowers/specs/2026-08-26-atelier-casework-design.md`

## Global Constraints

- Preserve the current palette, typography, direct-buyer copy, acquisition criteria, and route architecture.
- Add no runtime dependency, remote font, stock image, WebGL, or animation library.
- Keep all decorative layers non-interactive and hidden from assistive technology.
- Preserve WCAG AA contrast, visible focus, 44px touch targets, progressive enhancement, and reduced motion.
- Support 320px through 1920px without horizontal overflow.
- This folder has no Git metadata, so commit steps are intentionally omitted.

---

### Task 1: Add the Material Assets and Frame Primitive

**Files:**
- Create: `public/assets/leather-grain.svg`
- Create: `public/assets/paper-grain.svg`
- Create: `src/components/CaseFrame.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Test: `tests/material-ui.test.mjs`

**Interfaces:**
- Produces: `/assets/leather-grain.svg`, `/assets/paper-grain.svg`, and a decorative `<CaseFrame />` rendered once by `BaseLayout`.
- Consumes: existing `BaseLayout` document structure.

- [x] **Step 1: Write the failing browser contract test**

Add a Playwright-backed Node test that loads the rendered homepage and asserts that a single `aria-hidden` case frame is present, does not intercept pointer input, exposes a dashed stitched inset through computed styles, and that both texture asset URLs return HTTP 200.

- [x] **Step 2: Run the structural test and verify failure**

Run: `node --test tests/material-ui.test.mjs`  
Expected: FAIL because the material files do not exist.

- [x] **Step 3: Create lightweight original SVG grain assets**

Use `feTurbulence` plus restrained color/opacity transforms. Keep each asset local, decorative, and below 10KB.

- [x] **Step 4: Create and mount `CaseFrame`**

Render one `aria-hidden="true"` element containing four edge rails and four corner fittings. Mount it immediately after the skip link so it can be layered independently from semantic content.

- [x] **Step 5: Run the structural test**

Run: `node --test tests/material-ui.test.mjs`  
Expected: PASS.

### Task 2: Establish Shared Material Tokens and Responsive Frame Styling

**Files:**
- Modify: `src/styles/global.css`
- Test: `tests/material-ui.test.mjs`

**Interfaces:**
- Produces: shared tokens `--texture-leather`, `--texture-paper`, `--stitch-color`, `--brass-bevel`, `--deboss-shadow`, and frame layout rules.
- Consumes: assets and frame markup from Task 1.

- [x] **Step 1: Extend the browser test with frame and surface assertions**

Assert computed frame dimensions at desktop and mobile, verify no horizontal overflow, and confirm that a rendered leather surface resolves a background image containing `leather-grain.svg` while a paper surface resolves `paper-grain.svg`.

- [x] **Step 2: Run the test and verify failure**

Run: `node --test tests/material-ui.test.mjs`  
Expected: FAIL on missing material tokens.

- [x] **Step 3: Add material tokens and frame CSS**

Define leather and paper background stacks, inset stitch spacing, restrained bevel/deboss shadows, and non-interactive fixed rails. Keep the right rail clear of the scrollbar and reduce frame width/corner hardware below 480px.

- [x] **Step 4: Add reusable surface helpers**

Create shared `.material-leather`, `.material-paper`, `.stitched-panel`, and `.brass-fastener` helpers. Keep all pseudo-elements pointer-events-none.

- [x] **Step 5: Run the test and Astro check**

Run: `node --test tests/material-ui.test.mjs && npm run check`  
Expected: PASS and zero Astro diagnostics.

### Task 3: Restyle Navigation, Buttons, Heroes, CTA, and Footer

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/ButtonLink.astro`
- Modify: `src/components/HeroArtwork.astro`
- Modify: `src/components/PageHero.astro`
- Modify: `src/components/CtaBand.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/material-ui.test.mjs`

**Interfaces:**
- Produces: the primary leather/brass brand surfaces and stitched conversion controls used site-wide.
- Consumes: global tokens/helpers from Task 2 and existing component props unchanged.

- [x] **Step 1: Add rendered component-treatment assertions**

Load the rendered homepage and assert that primary buttons expose a dashed stitched pseudo-element, hero artwork exposes a visible casework border, and the header, hero, CTA band, and footer resolve the local leather texture.

- [x] **Step 2: Run the test and verify failure**

Run: `node --test tests/material-ui.test.mjs`  
Expected: FAIL on missing treatment markers.

- [x] **Step 3: Apply the leather rail and plaque controls**

Style the header, mobile menu, buttons, CTA band, and footer with consistent grain, seams, and tactile hover/active states. Do not change navigation or CTA copy.

- [x] **Step 4: Reframe hero artwork and page markers**

Add stitched perimeter, brass corner hardware, debossed graph treatment, and maker's-label styling without changing the underlying responsive illustration.

- [x] **Step 5: Apply the homepage seller-role plaque**

Convert `.owner-context__aside` into a responsive dark stitched plaque while maintaining readable contrast and the exact four positioning statements.

- [x] **Step 6: Run tests and Astro check**

Run: `npm test && node --test tests/material-ui.test.mjs && npm run check`  
Expected: all tests pass with zero Astro diagnostics.

### Task 4: Restyle Criteria, Sectors, Process, FAQs, and Inquiry Form

**Files:**
- Modify: `src/components/CriteriaBand.astro`
- Modify: `src/components/SectorGrid.astro`
- Modify: `src/components/ProcessSteps.astro`
- Modify: `src/components/FaqList.astro`
- Modify: `src/components/InquiryForm.astro`
- Modify: `src/pages/contact.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/material-ui.test.mjs`

**Interfaces:**
- Produces: paper folios, brass sequence medallions, leather process ledger, and framed inquiry sheet.
- Consumes: unchanged sector/process/form data and global material tokens from Task 2.

- [x] **Step 1: Add rendered semantic and material assertions**

Use the rendered DOM to assert that sectors and process remain ordered lists, FAQs retain native `details`, the inquiry form retains its `/api/inquiries` action, and each component exposes the expected visible border, background texture, or medallion treatment through computed styles.

- [x] **Step 2: Run the test and verify failure**

Run: `node --test tests/material-ui.test.mjs`  
Expected: FAIL on missing material classes while semantic assertions pass.

- [x] **Step 3: Build the criteria and sector folios**

Turn the criteria band into a mounted data sheet and sector entries into responsive paper cards with brass number medallions and one restrained corner detail.

- [x] **Step 4: Build the process ledger and FAQ rules**

Apply leather texture and stitched/debossed divisions to the process list. Apply bookbinder tooling lines and clear open-state feedback to FAQs.

- [x] **Step 5: Build the inquiry folio**

Frame the existing form as a paper sheet inside a navy leather surround. Preserve labels, validation, loading state, field sizing, and focus behavior.

- [x] **Step 6: Run tests and production build**

Run: `npm test && npm run test:content && node --test tests/material-ui.test.mjs && npm run build`  
Expected: all tests pass and production build succeeds.

### Task 5: Expand Browser Evidence and Complete Visual QA

**Files:**
- Modify: `scripts/browser-qa.mjs`
- Regenerate: `artifacts/browser-qa.json`
- Regenerate: `artifacts/screenshots/*.png`

**Interfaces:**
- Produces: current visual evidence and machine-readable QA results for the redesigned site.
- Consumes: the production server at `http://127.0.0.1:4321` and all implemented visual components.

- [x] **Step 1: Add screenshots for the final CTA and acquisition folio**

Extend browser QA to capture the final CTA, criteria band, process band, sectors, and contact form at desktop, plus hero/CTA/form at mobile. Retain existing route, axe, API, no-JavaScript, navigation, and overflow checks.

- [x] **Step 2: Build and start the production server**

Run: `npm run build` followed by `npm start` in a persistent terminal session.  
Expected: server listens on `127.0.0.1:4321`.

- [x] **Step 3: Run browser QA**

Run: `npm run qa:browser`  
Expected: all routes, WCAG checks, navigation behavior, API contracts, and responsive overflow checks pass.

- [x] **Step 4: Manually inspect visual evidence**

Review hero, criteria, seller-role plaque, sectors, process, final CTA, footer, and contact form at 320, 390, 768, 1024, 1440, and 1920. Confirm uniform grain scale, stitch spacing, corner hardware, readable text, clear controls, and no decorative obstruction.

- [x] **Step 5: Verify reduced motion and no-JavaScript presentation**

Use Playwright contexts with `reducedMotion: 'reduce'` and JavaScript disabled. Confirm content remains visible, material surfaces remain static, navigation is understandable, and the contact form remains present.

- [x] **Step 6: Run the final verification bundle**

Run: `npm test && npm run test:content && node --test tests/material-ui.test.mjs && npm run build && npm run qa:browser`  
Expected: every command exits 0 and `artifacts/browser-qa.json` contains an empty failures array.
