# Functional Folios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the repeated internal-page hero and section rhythm with six distinct, accessible acquisition folios plus restrained utility-page treatments, while leaving the homepage unchanged.

**Architecture:** Keep Astro’s server-rendered content and existing API contract. Add two small material-layout primitives, six route-specific interactive components and a lightweight progressive-enhancement controller; route styles remain scoped inside their pages so frozen homepage components and global CSS do not change.

**Tech Stack:** Astro 7.2.4, TypeScript, semantic HTML, scoped CSS, native browser APIs, Node test runner, Playwright Core and axe-core.

**Spec:** `docs/superpowers/specs/2026-08-26-functional-folios-design.md`

## Global Constraints

- Do not intentionally modify the homepage markup, content hierarchy, styles or screenshots.
- Preserve direct-buyer positioning: Hyperboards is not a broker, investment bank or adviser.
- Preserve the approximately `$750K–$2M` target EBITDA and `$2M–$6M` typical deal-value ranges.
- Preserve all nine approved sectors, exclusions and qualifying language.
- Do not add transaction-history, assets-under-management, funding-capacity or team-experience claims.
- Preserve the inquiry API fields, validation, honeypot, rate limit, body-size limit, same-origin enforcement and webhook contract.
- Use progressive enhancement: all primary copy, links, form fields and legal text remain available without JavaScript.
- Use no new runtime dependency or animation library.
- Animate only transform and opacity for repeated interactions; respect `prefers-reduced-motion`.
- Preserve `noindex` on investor, legal, thank-you and 404 utility routes where currently applied.
- Keep `node_modules/`, `dist/`, `.astro/`, `artifacts/`, local `.env` files and credentials out of Git.

## File Structure

**Create**

- `src/components/folios/FolioShell.astro` — shared semantic/material cover frame with copy and named visual/action slots.
- `src/components/folios/FolioLabel.astro` — route index and folio metadata label.
- `src/components/folios/MandateExplorer.astro` — acquisition-criteria and sector-selection interface.
- `src/components/folios/OwnerPathSelector.astro` — owner-stage and transition-path interface.
- `src/components/folios/UnderwritingLens.astro` — underwriting-dimension selector with mobile list fallback.
- `src/components/folios/RoleComparator.astro` — buyer/broker/adviser role comparison.
- `src/components/folios/IntakeGuidance.astro` — form-focus guidance panel.
- `src/components/folios/AlignmentLedger.astro` — investor-principle selector.
- `src/scripts/folio-controls.ts` — keyboard-safe selection and active-section helpers.
- `tests/functional-folios.test.mjs` — homepage freeze, route structure, semantics and content-regression contracts.

**Modify**

- `package.json` — run every `tests/*.test.mjs` file through Node’s test runner.
- `src/pages/what-we-acquire.astro`
- `src/pages/business-owners.astro`
- `src/pages/our-approach.astro`
- `src/pages/about.astro`
- `src/pages/contact.astro`
- `src/pages/investor-relationships.astro`
- `src/pages/privacy.astro`
- `src/pages/terms.astro`
- `src/pages/thank-you.astro`
- `src/pages/404.astro`
- `scripts/browser-qa.mjs` — add folio interaction and per-route visual assertions.

**Frozen by automated hash contract**

- `src/pages/index.astro`
- `src/components/HeroArtwork.astro`
- `src/components/CriteriaBand.astro`
- `src/components/CtaBand.astro`
- `src/components/FaqList.astro`
- `src/components/ProcessSteps.astro`
- `src/components/SectionIntro.astro`
- `src/components/SectorGrid.astro`
- `src/components/Header.astro`
- `src/components/Footer.astro`
- `src/styles/global.css`

---

### Task 1: Freeze the homepage and establish folio test contracts

**Files:**
- Create: `tests/functional-folios.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: current SHA-256 digests for homepage-owned files.
- Produces: `npm test` running both content and folio contracts.

- [ ] **Step 1: Write the homepage freeze test**

Create a Node test using `createHash`, `readFile` and a `Map` containing these exact digests:

```js
const frozenHomeFiles = new Map([
  ['src/pages/index.astro', 'ae51c4476877a9eff61fa6ac2705ab5a1ce0406ef127f9ffd25819a63cc2b9d6'],
  ['src/components/HeroArtwork.astro', 'f7cd2c53677768de55c7860fd59d6c737f02d511027b1229e238c854848a09a1'],
  ['src/components/CriteriaBand.astro', '1ca7bbadb992bbfcee6e85736a997f2785c227c595f99314c577dec49faeb456'],
  ['src/components/CtaBand.astro', '2e187cb634bfc21ecd7a54a69271fcace589bbbd833db28b5d1d375f96c6bdcb'],
  ['src/components/FaqList.astro', 'e6bd1235759f595e2b638f9aa321e0844f845322f667092529bec638bdaa6f59'],
  ['src/components/ProcessSteps.astro', 'b73f57b99dec3695a3268fd76da606e7a6d8b999e2bf6624e42c6412ee28d66f'],
  ['src/components/SectionIntro.astro', '7b8e11e96a326b5003e1387852490440d14b4bb1165af0ee208d828d77055709'],
  ['src/components/SectorGrid.astro', '73e6abd3f4491075b0e7c8cdbcdedf7094230c334519e6ff379acdc075daf785'],
  ['src/components/Header.astro', '146ea9b1452cd80a94bf7bf23b301210eb00df7ee18b6591cac6b84b0d0a7e69'],
  ['src/components/Footer.astro', 'd5988fdefa56cbc044625942e3396bad6e4342f0bb7fe99e763d2dc4f006568a'],
  ['src/styles/global.css', '9b0e05f190f35a228d2a705530d69b1cb986d37321be94d296a52ea6ba45d4cd'],
]);

test('homepage-owned source remains byte-for-byte frozen', async () => {
  for (const [file, expected] of frozenHomeFiles) {
    const digest = createHash('sha256').update(await readFile(file)).digest('hex');
    assert.equal(digest, expected, file);
  }
});
```

- [ ] **Step 2: Run the new test and verify it passes**

Run: `node --test tests/functional-folios.test.mjs`

Expected: PASS for the homepage freeze contract.

- [ ] **Step 3: Update the test script**

Change `package.json` from:

```json
"test": "node tests/content.test.mjs"
```

to:

```json
"test": "node --test tests/*.test.mjs"
```

- [ ] **Step 4: Run the combined suite**

Run: `npm test`

Expected: existing five content tests and the homepage freeze test pass.

- [ ] **Step 5: Commit**

```powershell
git add package.json tests/functional-folios.test.mjs
git commit -m "test: freeze homepage during folio redesign"
```

### Task 2: Build the shared folio frame and interaction controller

**Files:**
- Create: `src/components/folios/FolioShell.astro`
- Create: `src/components/folios/FolioLabel.astro`
- Create: `src/scripts/folio-controls.ts`
- Modify: `tests/functional-folios.test.mjs`

**Interfaces:**
- `FolioShell` props: `{ eyebrow: string; title: string; intro: string; index?: string }`; named slots: `visual`, `actions`.
- `FolioLabel` props: `{ index: string; label: string; note?: string }`.
- `initSingleSelect(root: HTMLElement): void` consumes `[data-folio-option][data-value]` and `[data-folio-panel][data-value]`.
- `initSectionTracker(root: HTMLElement): void` consumes local hash links and matching sections.

- [ ] **Step 1: Add failing component-contract tests**

Assert the two component files and controller exist; assert `FolioShell` contains one `<h1>`, named `visual` and `actions` slots, `data-folio-cover` and a `prefers-reduced-motion` rule; assert the controller source includes `ArrowLeft`, `ArrowRight`, `Home`, `End`, `aria-selected` and `hidden`.

- [ ] **Step 2: Verify failure**

Run: `node --test tests/functional-folios.test.mjs`

Expected: FAIL because the folio files do not exist.

- [ ] **Step 3: Implement the structural components**

`FolioShell.astro` renders the copy and slots inside a material cover but contains no route variants. Its scoped CSS provides the navy relief, fine panel stitch, responsive two-column foundation and a single cover-enter animation. `FolioLabel.astro` renders metadata only.

- [ ] **Step 4: Implement progressive selection**

`initSingleSelect` must:

```ts
export function initSingleSelect(root: HTMLElement): void {
  const options = [...root.querySelectorAll<HTMLButtonElement>('[data-folio-option]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-folio-panel]')];
  const activate = (value: string, focus = false) => {
    options.forEach((option) => {
      const selected = option.dataset.value === value;
      option.setAttribute('aria-selected', String(selected));
      option.tabIndex = selected ? 0 : -1;
      if (selected && focus) option.focus();
    });
    panels.forEach((panel) => { panel.hidden = panel.dataset.value !== value; });
  };
  options.forEach((option, index) => {
    option.addEventListener('click', () => activate(option.dataset.value ?? ''));
    option.addEventListener('keydown', (event) => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % options.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + options.length) % options.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = options.length - 1;
      else return;
      event.preventDefault();
      activate(options[next]?.dataset.value ?? '', true);
    });
  });
  activate(options.find((option) => option.getAttribute('aria-selected') === 'true')?.dataset.value ?? options[0]?.dataset.value ?? '');
  root.dataset.enhanced = 'true';
}

export function initSectionTracker(root: HTMLElement): void {
  const links = [...root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector<HTMLElement>(link.hash))
    .filter((section): section is HTMLElement => Boolean(section));
  if (!('IntersectionObserver' in window) || sections.length === 0) return;
  const observer = new IntersectionObserver((entries) => {
    const active = entries.find((entry) => entry.isIntersecting);
    if (!active) return;
    links.forEach((link) => {
      if (link.hash === `#${active.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
  sections.forEach((section) => observer.observe(section));
}
```

All panels remain visible in the server HTML until the controller applies `hidden`.

- [ ] **Step 5: Run tests and Astro diagnostics**

Run: `npm test; npm run check`

Expected: all tests pass; Astro reports 0 errors, warnings and hints.

- [ ] **Step 6: Commit**

```powershell
git add src/components/folios/FolioShell.astro src/components/folios/FolioLabel.astro src/scripts/folio-controls.ts tests/functional-folios.test.mjs
git commit -m "feat: add shared Functional Folio foundation"
```

### Task 3: Convert What We Acquire into the Mandate Desk

**Files:**
- Create: `src/components/folios/MandateExplorer.astro`
- Modify: `src/pages/what-we-acquire.astro`
- Modify: `tests/functional-folios.test.mjs`

**Interfaces:**
- Consumes: `criteria`, `sectors` and `exclusions` from `src/data/site.ts`; `FolioShell`; `initSingleSelect`.
- Produces: `[data-mandate-explorer]`, four criteria options, four panels and a sector folio tray.

- [ ] **Step 1: Add a failing Mandate Desk test**

Assert that the route no longer imports `PageHero`, contains `MandateExplorer`, preserves all four `criteria` values, imports approved `sectors` and renders the phrase “guidelines—not an automatic decision”. Assert the component has `role="tablist"`, `role="tab"`, `role="tabpanel"` and `aria-controls`.

- [ ] **Step 2: Verify failure**

Run: `node --test tests/functional-folios.test.mjs --test-name-pattern="Mandate"`

Expected: FAIL because the route still imports `PageHero`.

- [ ] **Step 3: Implement `MandateExplorer.astro`**

Render criteria tabs for `ebitda`, `deal-value`, `seller-role` and `geography`. Render a non-input range rail for the two financial criteria and explanatory panels for all four. Add a sector button tray and shared sector detail region; retain every sector’s existing name and rationale in server HTML.

- [ ] **Step 4: Replace the route cover and repeated first section**

Use `FolioShell` for the paper-dossier cover, move the approved criteria into the visual slot, remove the old `PageHero` and redundant profile grid, then retain and restyle characteristics, sectors, exclusions and CTA as the underwriting desk sequence.

- [ ] **Step 5: Verify**

Run: `npm test; npm run check; npm run build`

Expected: Mandate contracts pass; build succeeds.

- [ ] **Step 6: Commit**

```powershell
git add src/components/folios/MandateExplorer.astro src/pages/what-we-acquire.astro tests/functional-folios.test.mjs
git commit -m "feat: turn acquisition criteria into a Mandate Desk"
```

### Task 4: Convert For Business Owners into the Transition Map

**Files:**
- Create: `src/components/folios/OwnerPathSelector.astro`
- Modify: `src/pages/business-owners.astro`
- Modify: `tests/functional-folios.test.mjs`

**Interfaces:**
- Consumes: `FolioShell`, `initSingleSelect`, existing approved process and transition copy.
- Produces: `[data-owner-path]` with `exploring`, `preparing` and `ready` states.

- [ ] **Step 1: Add the failing owner-path test**

Assert no `PageHero` or `ProcessSteps` import, three semantic selection states, all three transition options and the direct-buyer/no-obligation language.

- [ ] **Step 2: Verify failure**

Run: `node --test tests/functional-folios.test.mjs --test-name-pattern="owner"`

Expected: FAIL on the old imports.

- [ ] **Step 3: Implement the selector and route**

Render the three starting positions as accessible tabs with concise approved outcomes. Render the five process stages as a route line and the three transition paths as an accessible comparison rail. Keep the confidentiality notice and both existing CTAs.

- [ ] **Step 4: Add route-specific motion and mobile adaptation**

Draw the route using a transform-based reveal on a pseudo-element; move only the marker on selection. At widths below 48rem, use a vertical route and full-width 44px controls.

- [ ] **Step 5: Verify and commit**

Run: `npm test; npm run check; npm run build`

```powershell
git add src/components/folios/OwnerPathSelector.astro src/pages/business-owners.astro tests/functional-folios.test.mjs
git commit -m "feat: create the owner Transition Map"
```

### Task 5: Convert Our Approach into the Underwriting Lens

**Files:**
- Create: `src/components/folios/UnderwritingLens.astro`
- Modify: `src/pages/our-approach.astro`
- Modify: `tests/functional-folios.test.mjs`

**Interfaces:**
- Consumes: eight `underwritingLens` labels, five approved principles, `FolioShell`, `initSingleSelect`.
- Produces: `[data-underwriting-lens]` with eight controls and eight descriptions.

- [ ] **Step 1: Add and fail the lens test**

Require no `PageHero`; require all eight dimensions, the exact sentence “We are the buyer. We do not represent the seller.” and a visible statement that the dimensions inform judgment rather than a score.

Run: `node --test tests/functional-folios.test.mjs --test-name-pattern="Underwriting"`

Expected: FAIL before the component exists.

- [ ] **Step 2: Implement the responsive lens**

Desktop uses an eight-position circular diagram around a central `Business` label. Controls remain real buttons in DOM order. Below 48rem, CSS replaces the diagram with a vertical tab/accordion-like list; no horizontal scrolling is required.

- [ ] **Step 3: Restyle principles as field memos**

Remove the equal-card grid. Render the five principles as a numbered vertical memo sequence with focused/hover states and no repeated generic tiles.

- [ ] **Step 4: Verify and commit**

Run: `npm test; npm run check; npm run build`

```powershell
git add src/components/folios/UnderwritingLens.astro src/pages/our-approach.astro tests/functional-folios.test.mjs
git commit -m "feat: build the interactive Underwriting Lens"
```

### Task 6: Convert About into the Buyer’s Charter

**Files:**
- Create: `src/components/folios/RoleComparator.astro`
- Modify: `src/pages/about.astro`
- Modify: `tests/functional-folios.test.mjs`

**Interfaces:**
- Consumes: buyer/broker/adviser definitions, values and `criteria`.
- Produces: `[data-role-comparator]` with neutral role comparison and buyer selected by default.

- [ ] **Step 1: Add and fail the role-comparison test**

Require no `PageHero`; require Buyer, Broker and Adviser options; require buyer selected by default; require the phrases “We buy businesses” and “prospective buyer”.

- [ ] **Step 2: Implement the charter**

Create an asymmetric cover with an embossed H seal and a neutral comparison control. Convert values into four numbered charter clauses. Render acquisition figures as a compact mandate stamp and preserve the quiet investor link.

- [ ] **Step 3: Verify and commit**

Run: `npm test; npm run check; npm run build`

```powershell
git add src/components/folios/RoleComparator.astro src/pages/about.astro tests/functional-folios.test.mjs
git commit -m "feat: present About as the Buyers Charter"
```

### Task 7: Convert Contact into the Confidential Intake

**Files:**
- Create: `src/components/folios/IntakeGuidance.astro`
- Modify: `src/pages/contact.astro`
- Modify: `tests/functional-folios.test.mjs`

**Interfaces:**
- Consumes unchanged `InquiryForm` and its names: `fullName`, `email`, `phone`, `company`, `companyWebsite`, `location`, `industry`, `ebitda`, `role`, `message`, `companyFax`, `acknowledgement`.
- Produces: `[data-intake-workspace]` and a live guidance panel with `contact`, `profile` and `message` states.

- [ ] **Step 1: Add the failing intake contract**

Snapshot the exact field-name set above by reading `InquiryForm.astro`; assert no `PageHero` on Contact; assert `IntakeGuidance` includes the sensitive-information warning and an `aria-live="polite"` status region.

- [ ] **Step 2: Verify failure**

Run: `node --test tests/functional-folios.test.mjs --test-name-pattern="intake"`

Expected: FAIL because Contact still uses `PageHero`.

- [ ] **Step 3: Implement integrated intake guidance**

Wrap the existing form and guidance in one workspace. Map `fullName/email/phone` to contact, `company/companyWebsite/location/industry/ebitda/role` to profile and `message/acknowledgement` to message. On `focusin`, update the selected chapter and polite guidance text; never intercept submission or mutate form values.

- [ ] **Step 4: Verify API regression safety**

Run: `npm test; npm run test:content; npm run build`

Expected: field contract, content policy and build pass.

- [ ] **Step 5: Commit**

```powershell
git add src/components/folios/IntakeGuidance.astro src/pages/contact.astro tests/functional-folios.test.mjs
git commit -m "feat: integrate the Confidential Intake workspace"
```

### Task 8: Convert Investor Relationships into the Alignment Ledger

**Files:**
- Create: `src/components/folios/AlignmentLedger.astro`
- Modify: `src/pages/investor-relationships.astro`
- Modify: `tests/functional-folios.test.mjs`

**Interfaces:**
- Consumes: four approved working principles, acquisition range and securities disclaimer.
- Produces: `[data-alignment-ledger]` with four selectable entries.

- [ ] **Step 1: Add and fail the ledger test**

Require no `PageHero`, preserved `noindex={true}`, four principles, approved ranges and the exact sentence “This page is not an investment offering.”

- [ ] **Step 2: Implement the discreet ledger**

Render ledger entries as semantic tabs with a shared detail sheet, compact acquisition context and unchanged disclaimer meaning. Keep brass use sparse and selection motion under 300ms.

- [ ] **Step 3: Verify and commit**

Run: `npm test; npm run check; npm run build`

```powershell
git add src/components/folios/AlignmentLedger.astro src/pages/investor-relationships.astro tests/functional-folios.test.mjs
git commit -m "feat: create the investor Alignment Ledger"
```

### Task 9: Give utility routes distinct document treatments

**Files:**
- Modify: `src/pages/privacy.astro`
- Modify: `src/pages/terms.astro`
- Modify: `src/pages/thank-you.astro`
- Modify: `src/pages/404.astro`
- Modify: `tests/functional-folios.test.mjs`

**Interfaces:**
- Consumes: `FolioLabel`, `initSectionTracker`, unchanged legal and acknowledgement copy.
- Produces: Privacy document reader, Terms clause ledger, Thank You review receipt and 404 route index.

- [ ] **Step 1: Add failing utility-route contracts**

Require all four routes to stop importing `PageHero`. Require Privacy’s section navigation and interim warning, Terms’ seven numbered clauses and provisional warning, Thank You’s three next steps and 404’s three recovery links.

- [ ] **Step 2: Implement Privacy and Terms**

Privacy receives a sticky index with active-section `aria-current="location"` and a transform-based progress thread. Terms uses native `<details>` summaries for each numbered clause, with all legal copy rendered inside the DOM and the first clause open by default.

- [ ] **Step 3: Implement Thank You and 404**

Thank You becomes a compact accepted-introduction receipt without timing promises. 404 becomes a case index card with immediate semantic recovery links.

- [ ] **Step 4: Verify and commit**

Run: `npm test; npm run check; npm run build`

```powershell
git add src/pages/privacy.astro src/pages/terms.astro src/pages/thank-you.astro src/pages/404.astro tests/functional-folios.test.mjs
git commit -m "feat: distinguish legal and utility document routes"
```

### Task 10: Extend browser QA, visually review and publish

**Files:**
- Modify: `scripts/browser-qa.mjs`
- Modify: `tests/functional-folios.test.mjs` only if a verified regression needs a permanent contract.

**Interfaces:**
- Consumes: all route data attributes and existing QA report schema.
- Produces: fresh screenshots and interaction/accessibility evidence for 10 routes.

- [ ] **Step 1: Add browser interaction checks**

Extend QA to:

```js
const expectSelectedPanel = async (page, root, value) => {
  const option = page.locator(`${root} [data-folio-option][data-value="${value}"]`);
  const panel = page.locator(`${root} [data-folio-panel][data-value="${value}"]`);
  assert.equal(await option.getAttribute('aria-selected'), 'true');
  assert.equal(await panel.isVisible(), true);
};

await page.goto(`${baseUrl}/what-we-acquire`, { waitUntil: 'networkidle' });
await page.locator('[data-mandate-explorer] [data-folio-option]').nth(1).click();
await expectSelectedPanel(page, '[data-mandate-explorer]', 'deal-value');

await page.goto(`${baseUrl}/business-owners`, { waitUntil: 'networkidle' });
await page.locator('[data-owner-path] [data-folio-option]').nth(1).focus();
await page.keyboard.press('ArrowRight');

await page.goto(`${baseUrl}/contact`, { waitUntil: 'networkidle' });
await page.locator('[name="company"]').focus();
assert.equal(await page.locator('[data-intake-guidance]').getAttribute('data-active'), 'profile');
```

Also verify each primary route has exactly one `h1`, no horizontal overflow and zero serious axe violations.

- [ ] **Step 2: Run the full static suite**

Run:

```powershell
npm audit
npm test
npm run test:content
npm run check
npm run build
```

Expected: audit clean; all tests pass; 0 Astro errors, warnings and hints; production build succeeds.

- [ ] **Step 3: Restart the production preview and run browser QA**

Start: `$env:HOST='127.0.0.1'; npm start`

Run: `npm run qa:browser`

Expected: 10 routes pass, desktop/mobile screenshots are created, all interaction contracts pass, no request/page/console failures are recorded and reduced-motion checks pass.

- [ ] **Step 4: Perform visual review**

Inspect desktop and mobile screenshots for every changed route. Confirm:

- each primary route has a visibly different cover and functional module;
- navy relief, paper, stitches and brass remain coherent;
- content does not overlap at 320px, 390px, 768px, 1024px and 1920px;
- focus, selected and expanded states are visible;
- the homepage matches its frozen source and approved composition.

- [ ] **Step 5: Commit QA and push**

```powershell
git add scripts/browser-qa.mjs tests/functional-folios.test.mjs
git commit -m "test: verify Functional Folios across routes"
git status --short
git push origin main
git ls-remote origin refs/heads/main
```

Expected: clean working tree and remote `main` SHA equal to local `HEAD`.
