# Hyperboards Design Gallery and Preview Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a six-option homepage design gallery, preserve every finalized concept in an isolated full-viewport preview, and finish the leather site's gold CTAs with inset navy saddle stitching.

**Architecture:** The root Astro route becomes a neutral chooser driven by one typed design registry. Each choice opens a same-origin iframe inside a shared preview shell, keeping standalone prototype CSS and JavaScript isolated; a tiny parent-level `All designs` link always remains available. Canonical prototype packages are deterministically mirrored into `public`, while the current Astro homepage is extracted into a reusable component for its dedicated preview-content route.

**Tech Stack:** Astro 7.2.4, TypeScript, semantic HTML, scoped CSS, dependency-free JavaScript, Node test runner, Playwright/Edge, axe-core.

**Spec:** `docs/superpowers/specs/2026-08-27-design-gallery-preview-publishing-design.md`

## Global Constraints

- Gallery order is Hyperboards Original, Evergreen Partner, Blackline Office, Cobalt Standard, Quiet Cinema, Operators Atlas.
- `All designs` is the only preview chrome and must remain extremely small in the top-left corner.
- Standalone concepts retain their latest canonical HTML, CSS, and JavaScript byte-for-byte.
- Hyperboards Original retains its approved rendering except for the shared gold-primary-CTA material revision.
- Primary CTA stitching sits inside the gold face and uses navy thread matching the leather field.
- No unsupported commercial claims, owner-data collection, third-party JavaScript, or source-controlled credentials.
- Gallery and preview routes remain `noindex, nofollow`.
- All interactions remain keyboard operable and respect `prefers-reduced-motion`.

---

### Task 1: Design registry and deterministic preview publishing

**Files:**
- Create: `src/data/designs.ts`
- Create: `scripts/sync-design-previews.mjs`
- Create: `tests/design-gallery.test.mjs`
- Create: `public/design-previews/evergreen-partner/index.html`
- Create: `public/design-previews/evergreen-partner/styles.css`
- Create: `public/design-previews/evergreen-partner/script.js`
- Create corresponding three-file mirrors for `blackline-office`, `cobalt-standard`, `quiet-cinema`, and `operators-atlas`
- Modify: `package.json`

**Interfaces:**
- Produces: `DesignOption` and ordered `designs: readonly DesignOption[]`.
- Produces: `designBySlug(slug: string): DesignOption | undefined`.
- Produces: `npm run sync:designs`, which mirrors the five canonical prototype packages.
- Consumes: canonical folders listed in the approved specification.

- [ ] **Step 1: Write the failing registry and mirror contract**

Add source assertions to `tests/design-gallery.test.mjs`:

```js
const expected = [
  ['hyperboards', 'Hyperboards Original'],
  ['evergreen-partner', 'Evergreen Partner'],
  ['blackline-office', 'Blackline Office'],
  ['cobalt-standard', 'Cobalt Standard'],
  ['quiet-cinema', 'Quiet Cinema'],
  ['operators-atlas', 'Operators Atlas'],
];

test('design registry exposes the approved order and content routes', async () => {
  const source = await readFile(join(projectRoot, 'src/data/designs.ts'), 'utf8');
  let cursor = -1;
  for (const [slug, name] of expected) {
    const next = source.indexOf(`slug: '${slug}'`);
    assert.ok(next > cursor, `${name} must appear in approved order`);
    assert.ok(source.includes(`name: '${name}'`));
    cursor = next;
  }
});

test('published prototype files are byte-identical to canonical sources', async () => {
  for (const item of prototypeMappings) {
    for (const file of ['index.html', 'styles.css', 'script.js']) {
      assert.deepEqual(
        await readFile(join(projectRoot, 'public/design-previews', item.slug, file)),
        await readFile(join(projectRoot, item.source, file)),
      );
    }
  }
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `node --test tests/design-gallery.test.mjs`  
Expected: FAIL because the registry and public mirrors do not exist.

- [ ] **Step 3: Implement the typed registry**

Create `src/data/designs.ts` with this stable interface:

```ts
export interface DesignOption {
  slug: string;
  name: string;
  descriptor: string;
  thumbnail: string;
  contentUrl: string;
  original?: boolean;
}

export const designs = [
  { slug: 'hyperboards', name: 'Hyperboards Original', descriptor: 'Navy leather · tailored casework', thumbnail: '/design-thumbnails/hyperboards.webp', contentUrl: '/design-content/hyperboards', original: true },
  { slug: 'evergreen-partner', name: 'Evergreen Partner', descriptor: 'Family-office restraint · enduring green', thumbnail: '/design-thumbnails/evergreen-partner.webp', contentUrl: '/design-previews/evergreen-partner/index.html' },
  { slug: 'blackline-office', name: 'Blackline Office', descriptor: 'Monochrome precision · Swiss discipline', thumbnail: '/design-thumbnails/blackline-office.webp', contentUrl: '/design-previews/blackline-office/index.html' },
  { slug: 'cobalt-standard', name: 'Cobalt Standard', descriptor: 'Institutional clarity · modern cobalt', thumbnail: '/design-thumbnails/cobalt-standard.webp', contentUrl: '/design-previews/cobalt-standard/index.html' },
  { slug: 'quiet-cinema', name: 'Quiet Cinema', descriptor: 'Editorial storytelling · cinematic restraint', thumbnail: '/design-thumbnails/quiet-cinema.webp', contentUrl: '/design-previews/quiet-cinema/index.html' },
  { slug: 'operators-atlas', name: 'Operators Atlas', descriptor: 'Operational fieldwork · cartographic focus', thumbnail: '/design-thumbnails/operators-atlas.webp', contentUrl: '/design-previews/operators-atlas/index.html' },
] as const satisfies readonly DesignOption[];

export const designBySlug = (slug: string) => designs.find((design) => design.slug === slug);
```

- [ ] **Step 4: Implement deterministic synchronization**

Create `scripts/sync-design-previews.mjs` using fixed mappings only:

```js
import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mappings = [
  ['prototypes/frontpage-concepts-v2/01-evergreen-partner', 'evergreen-partner'],
  ['prototypes/frontpage-concepts-v2/03-blackline-office', 'blackline-office'],
  ['prototypes/frontpage-concepts-v2/02-cobalt-standard', 'cobalt-standard'],
  ['prototypes/frontpage-concepts/03-quiet-cinema', 'quiet-cinema'],
  ['prototypes/frontpage-concepts/02-operators-atlas', 'operators-atlas'],
];

for (const [source, slug] of mappings) {
  const target = join(root, 'public', 'design-previews', slug);
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
  for (const file of ['index.html', 'styles.css', 'script.js']) {
    await cp(join(root, source, file), join(target, file));
  }
}
```

Add `"sync:designs": "node scripts/sync-design-previews.mjs"` and prefix `build` with `npm run sync:designs &&`.

- [ ] **Step 5: Generate mirrors and pass the focused test**

Run: `npm run sync:designs && node --test tests/design-gallery.test.mjs`  
Expected: registry order and all mirror equality assertions PASS.

- [ ] **Step 6: Commit the publishing foundation**

```powershell
git add -- src/data/designs.ts scripts/sync-design-previews.mjs tests/design-gallery.test.mjs public/design-previews package.json
git commit -m "feat: add finalized design preview registry"
```

### Task 2: Preserve the leather homepage and revise its primary CTA material

**Files:**
- Create: `src/components/home/LeatherHomepage.astro`
- Create: `src/pages/design-content/hyperboards.astro`
- Create: `public/assets/saddle-stitch-navy-horizontal.svg`
- Create: `public/assets/saddle-stitch-navy-vertical.svg`
- Modify: `src/components/ButtonLink.astro`
- Modify: `tests/material-ui.test.mjs`
- Modify: `tests/functional-folios.test.mjs`

**Interfaces:**
- Produces: `<LeatherHomepage />`, containing the former root homepage sections and scoped styles without content changes.
- Produces: `/design-content/hyperboards`, rendered through `BaseLayout`.
- Consumes: existing components and `BaseLayout` without modifying their public APIs.

- [ ] **Step 1: Update the failing material contract**

Change the primary CTA browser assertion to require the new navy stitch assets and brass carrier:

```js
assert.match(treatments.primaryStitch, /saddle-stitch-navy-horizontal\.svg/);
assert.match(treatments.primaryStitch, /saddle-stitch-navy-vertical\.svg/);
assert.doesNotMatch(treatments.primaryCarrier, /leather-relief\.jpg/);
assert.notEqual(treatments.primaryPlate, 'none');
assert.ok(treatments.primaryInset >= 5, 'stitching must sit inside the gold face');
```

Replace the obsolete homepage hash freeze in `tests/functional-folios.test.mjs` with a rendered-content ownership assertion for `LeatherHomepage.astro`.

- [ ] **Step 2: Run material tests and confirm failure**

Run against the current local preview: `node --test tests/material-ui.test.mjs tests/functional-folios.test.mjs`  
Expected: FAIL because navy thread assets and the extracted homepage do not yet exist.

- [ ] **Step 3: Extract the leather homepage without rewriting it**

Move the current imports, section markup, and scoped style block from `src/pages/index.astro` into `src/components/home/LeatherHomepage.astro`. Create `src/pages/design-content/hyperboards.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import LeatherHomepage from '../../components/home/LeatherHomepage.astro';
---

<BaseLayout noindex>
  <LeatherHomepage />
</BaseLayout>
```

- [ ] **Step 4: Add navy saddle-stitch assets**

Create horizontal and vertical SVG variants derived from the approved natural saddle geometry. Keep the stitch/hole proportions but replace the light thread strokes with `#0B1B36` and use a restrained dark-blue thread shadow suitable for brass.

- [ ] **Step 5: Rebuild the primary CTA layer order**

In `ButtonLink.astro`, make `.button--primary` the brass carrier with a thin gold boundary; use `::before` for the inset navy stitch frame and `::after` for restrained brass highlight/bevel below it. Preserve label/arrow z-index, focus treatment, hover lift, and pressed state.

The computed style must resolve as:

```css
.button--primary {
  border: 1px solid rgba(255, 232, 154, 0.86);
  background: var(--color-brass);
  color: var(--color-midnight);
}

.button--primary::before {
  inset: 0.32rem;
  background:
    url('/assets/saddle-stitch-navy-horizontal.svg') left top / 24px 4px repeat-x,
    url('/assets/saddle-stitch-navy-horizontal.svg') left bottom / 24px 4px repeat-x,
    url('/assets/saddle-stitch-navy-vertical.svg') left top / 4px 24px repeat-y,
    url('/assets/saddle-stitch-navy-vertical.svg') right top / 4px 24px repeat-y;
}
```

- [ ] **Step 6: Run focused content and material verification**

Run: `npm run check && npm run test:content`  
Then run the material suite with the preview server active.  
Expected: extracted homepage compiles, direct-buyer content policy passes, and the primary CTA uses an inset navy seam on brass.

- [ ] **Step 7: Commit the leather-site preservation**

```powershell
git add -- src/components/home/LeatherHomepage.astro src/pages/design-content/hyperboards.astro src/components/ButtonLink.astro public/assets/saddle-stitch-navy-horizontal.svg public/assets/saddle-stitch-navy-vertical.svg tests/material-ui.test.mjs tests/functional-folios.test.mjs
git commit -m "feat: finish leather CTAs with inset navy stitching"
```

### Task 3: Neutral design gallery and accurate thumbnails

**Files:**
- Create: `src/layouts/DesignGalleryLayout.astro`
- Create: `src/components/design-gallery/DesignCard.astro`
- Replace: `src/pages/index.astro`
- Create: `scripts/capture-design-thumbnails.mjs`
- Create: `public/design-thumbnails/*.webp`
- Modify: `tests/design-gallery.test.mjs`

**Interfaces:**
- Consumes: ordered `designs` registry.
- Produces: root `/` with six semantic card links to `/designs/<slug>`.
- Produces: 16:10 local thumbnails with fixed dimensions.

- [ ] **Step 1: Add failing gallery structure assertions**

Add tests requiring one `h1`, exactly six design links, approved order, local thumbnail paths, and no `BaseLayout` import in the new root page:

```js
test('root gallery is neutral and links all six designs', async () => {
  const source = await readFile(join(projectRoot, 'src/pages/index.astro'), 'utf8');
  assert.match(source, /DesignGalleryLayout/);
  assert.match(source, /Choose a homepage direction/i);
  assert.match(source, /designs\.map/);
  assert.doesNotMatch(source, /BaseLayout/);
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `node --test tests/design-gallery.test.mjs`  
Expected: FAIL because the root is still the leather homepage.

- [ ] **Step 3: Implement the gallery-only layout**

Create `DesignGalleryLayout.astro` with `noindex, nofollow`, one skip link, local font imports already installed in the repo, neutral colors, and no production header/footer/case frame. Use a paper/ink visual system, precise rules, and minimal motion.

- [ ] **Step 4: Implement the semantic design card**

`DesignCard.astro` receives `{ design, index }`; one anchor wraps the thumbnail, ordinal, name, descriptor, and `Open design` label. Include width/height attributes, descriptive alt text, native lazy loading after the first card, and a full-card `:focus-visible` outline.

- [ ] **Step 5: Replace the root page**

Render a compact header and the six cards from `designs`:

```astro
<DesignGalleryLayout title="Hyperboards — Homepage Design Review">
  <header class="gallery-intro">
    <p>Hyperboards / Design review</p>
    <h1>Choose a homepage direction.</h1>
    <span>Six finalized approaches · Select any design to preview</span>
  </header>
  <main id="gallery-content" class="design-grid">
    {designs.map((design, index) => <DesignCard design={design} index={index} />)}
  </main>
</DesignGalleryLayout>
```

- [ ] **Step 6: Capture and optimize accurate thumbnails**

Create a Playwright script that visits every design content URL at a 1440×900 viewport, captures the initial viewport, and writes 960×600 WebP images under `public/design-thumbnails/`. It must use the repository's configured Edge channel and local server.

- [ ] **Step 7: Pass gallery source tests**

Run: `node --test tests/design-gallery.test.mjs`  
Expected: six cards, local assets, and approved ordering PASS.

- [ ] **Step 8: Commit the chooser**

```powershell
git add -- src/layouts/DesignGalleryLayout.astro src/components/design-gallery/DesignCard.astro src/pages/index.astro scripts/capture-design-thumbnails.mjs public/design-thumbnails tests/design-gallery.test.mjs
git commit -m "feat: add finalized homepage design gallery"
```

### Task 4: Isolated full-viewport preview shell and tiny return control

**Files:**
- Create: `src/pages/designs/[slug].astro`
- Modify: `tests/design-gallery.test.mjs`

**Interfaces:**
- Consumes: `designs` and `design.contentUrl`.
- Produces: six prerendered `/designs/<slug>` routes.
- Produces: one parent-level `All designs` link returning to `/`.

- [ ] **Step 1: Add failing shell assertions**

Require static paths from the registry, a titled iframe, `/` return link, and small visible control contract:

```js
assert.match(source, /getStaticPaths/);
assert.match(source, /title={`\$\{design\.name\} homepage preview`}/);
assert.match(source, /href="\/"[^>]*>\s*.*All designs/s);
assert.match(source, /min-height:\s*24px/);
assert.match(source, /top:\s*clamp\(/);
assert.match(source, /left:\s*clamp\(/);
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `node --test tests/design-gallery.test.mjs`  
Expected: FAIL because the preview shell does not exist.

- [ ] **Step 3: Implement static paths and full-viewport iframe**

Use `getStaticPaths()` over the registry, set `prerender = true`, render a document with no scrollable parent chrome, and size the iframe to `100dvw × 100dvh` with `border: 0`.

- [ ] **Step 4: Implement the smallest practical return tab**

Place the parent link at the top-left with approximately 26px visible height, compact 10px uppercase type, a subtle two-tone background that works over light and dark designs, and no icon larger than the text. Keep it visually under 90px wide, but preserve a minimum 24px target and strong outline:

```css
.all-designs {
  position: fixed;
  z-index: 20;
  top: clamp(0.25rem, 0.6vw, 0.45rem);
  left: clamp(0.25rem, 0.6vw, 0.45rem);
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  padding: 0.18rem 0.42rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  font-size: 0.625rem;
  letter-spacing: 0.07em;
}
```

- [ ] **Step 5: Pass focused route tests**

Run: `npm run check && node --test tests/design-gallery.test.mjs`  
Expected: six generated routes, unique iframe titles, and the small top-left return contract PASS.

- [ ] **Step 6: Commit the preview shell**

```powershell
git add -- 'src/pages/designs/[slug].astro' tests/design-gallery.test.mjs
git commit -m "feat: add isolated full-screen design previews"
```

### Task 5: Browser QA, screenshots, and final integration

**Files:**
- Create: `scripts/design-gallery-qa.mjs`
- Modify: `package.json`
- Modify: `README.md`
- Create: `artifacts/design-gallery-qa.json`
- Create: `artifacts/design-gallery/*.png`

**Interfaces:**
- Produces: `npm run qa:designs`.
- Consumes: built local server at `QA_BASE_URL` or `http://127.0.0.1:4321`.
- Produces: desktop/mobile screenshots and machine-readable QA evidence.

- [ ] **Step 1: Write browser QA before integration changes**

The script must check:

```js
const routes = ['/', ...designs.map(({ slug }) => `/designs/${slug}`)];
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];
```

For the gallery, assert six visible links in the approved order and keyboard-focus the first card. For each preview, assert the iframe loads, the `All designs` link is top-left and visually no more than 96×34px, the frame content has one `h1`, local assets return 200, horizontal overflow is absent, console/page errors are empty, and axe reports no serious/critical violations. Capture full-page gallery screenshots and viewport preview screenshots.

- [ ] **Step 2: Add QA scripts and documentation**

Add `"qa:designs": "node scripts/design-gallery-qa.mjs"` to `package.json`. Document the gallery routes, `npm run sync:designs`, and `npm run qa:designs` in `README.md`.

- [ ] **Step 3: Run all source tests**

Run: `npm test`  
Expected: all existing concept, content, folio, material-contract, and new gallery tests PASS.

- [ ] **Step 4: Run policy and type checks**

Run: `npm run test:content && npm run check`  
Expected: no unsupported claims and zero Astro errors, warnings, or hints.

- [ ] **Step 5: Build and start the production server**

Run: `npm run build`  
Start: `npm start`  
Expected: sync runs before build; server listens on `127.0.0.1:4321`.

- [ ] **Step 6: Run browser and material QA**

Run: `npm run qa:designs` and `node --test tests/material-ui.test.mjs` while the server is active.  
Expected: all six previews pass desktop/mobile overflow, keyboard, asset, console, and accessibility checks; navy stitching resolves inside the gold CTA.

- [ ] **Step 7: Review screenshot evidence**

Inspect the gallery desktop/mobile captures plus every preview capture. Confirm thumbnails match the latest concepts, no return tab obscures a logo or primary navigation label, and the CTA seam remains readable without resembling an outer leather carrier.

- [ ] **Step 8: Run final repository checks**

Run:

```powershell
git diff --check
git status --short
git diff --stat origin/main...HEAD
git grep -n -E 'github_pat_|ghp_' -- . ':(exclude)package-lock.json'
```

Expected: no whitespace errors, intended files only, and no credentials in tracked source.

- [ ] **Step 9: Commit final QA integration**

```powershell
git add -- scripts/design-gallery-qa.mjs package.json README.md artifacts/design-gallery-qa.json artifacts/design-gallery
git commit -m "test: verify published design gallery"
```

- [ ] **Step 10: Push the requested main branch**

Run: `git push origin main`  
Expected: `main` updates successfully using the configured credential helper; no token appears in the command or remote URL.
