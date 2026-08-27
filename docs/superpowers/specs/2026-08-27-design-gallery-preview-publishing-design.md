# Hyperboards Design Gallery and Preview Publishing Design

**Date:** 2026-08-27  
**Status:** Approved in chat  
**Scope:** Publish the six finalized homepage directions behind a simple design chooser and apply the final stitched-brass CTA treatment to the approved leather site.

## Purpose

Turn the current repository into a reviewable design-selection site. The root page is no longer a marketing homepage; it is a restrained gallery from which the manager can open each finalized direction at full viewport size, inspect it without cross-concept style collisions, and return to the gallery immediately.

This is a presentation layer for choosing a homepage direction. It does not merge the five standalone concepts into the production Astro site, expand their claims, or change the established direct-buyer strategy.

## Finalized Designs and Order

The root gallery must show these clickable panels in this exact order:

1. Hyperboards Original — the approved navy leather-and-stitching Astro site.
2. Evergreen Partner — latest source from `prototypes/frontpage-concepts-v2/01-evergreen-partner/`.
3. Blackline Office — latest source from `prototypes/frontpage-concepts-v2/03-blackline-office/`.
4. Cobalt Standard — latest source from `prototypes/frontpage-concepts-v2/02-cobalt-standard/`. The manager's “Codebolt Standard” wording is treated as a reference to this existing concept.
5. Quiet Cinema — latest source from `prototypes/frontpage-concepts/03-quiet-cinema/`.
6. Operators Atlas — latest source from `prototypes/frontpage-concepts/02-operators-atlas/`.

Continuum House and all other concept studies remain in the repository but are not published in the gallery.

## Selected Architecture

### Gallery

`/` becomes a dedicated Astro design-gallery page with no production-site header, footer, case frame, or inquiry UI. It uses a quiet neutral review aesthetic so it does not bias selection toward one concept.

Each panel contains an accurate locally stored screenshot thumbnail, design name, short art-direction label, and an `Open design` affordance. The complete panel is a semantic link. Layout is two columns on suitable desktop widths and one column on narrow screens. The Hyperboards Original panel is first and clearly identified as the current approved site.

### Preview routes

The six public review routes are:

- `/designs/hyperboards`
- `/designs/evergreen-partner`
- `/designs/blackline-office`
- `/designs/cobalt-standard`
- `/designs/quiet-cinema`
- `/designs/operators-atlas`

A shared Astro preview shell renders the selected homepage in a same-origin, full-viewport iframe. This boundary is intentional: each finalized concept keeps its own typography, selectors, JavaScript, responsive behavior, and document structure without leaking into the gallery or another concept.

The five standalone prototype packages are mirrored byte-for-byte into deployable public preview directories. Their original prototype folders remain the canonical design sources. An automated contract verifies that every published HTML, CSS, and JavaScript file matches its canonical source so stale previews cannot be shipped accidentally.

The existing leather homepage is extracted without content or layout changes into a reusable Astro homepage component and rendered at a dedicated preview-content route. Existing internal links continue to work within the preview frame.

### Return control

Every preview shell exposes one fixed `All designs` link in the top-left corner, returning to `/`.

- It is the smallest practical visible control: a compact, low-profile tab with abbreviated spacing and no secondary text.
- Its visible treatment is deliberately subordinate to the preview and occupies only the top-left corner.
- The interactive target remains at least 24 by 24 CSS pixels, has a visible keyboard focus state, and stays readable against both light and dark concepts.
- It lives outside the iframe, so it remains available even when a visitor follows an internal link inside a preview.
- Browser Back also returns naturally to the gallery.

No other review toolbar, frame, title strip, or persistent chrome is added.

## Leather CTA Material Change

The content, colors, layout, leather texture, perimeter stitching, panels, and hardware of Hyperboards Original remain unchanged. Only the gold primary CTA material is revised, affecting the `Discuss a sale` and `Discuss selling your business` controls that use the shared primary CTA treatment.

The revised layer order is:

1. A thin gold outer lining.
2. A dimensional gold/brass button face.
3. A fine saddle-stitch seam inset inside that gold face.
4. Navy-blue thread matching the site's leather field, with restrained hole/shadow detail for legibility.
5. Existing navy label and arrow above the material layers.

The former blue-leather carrier and gold thread outside the brass face are removed from these controls. Hover and pressed states preserve the same hierarchy and do not shift the seam outside the gold face.

## Content and Security Boundaries

- Every concept retains the approved direct-buyer positioning, `$750K–$2M` target EBITDA, `$2M–$6M` typical deal value, nine sectors, and non-promissory language.
- No completed-deal, assets-under-management, permanent-capital, guaranteed-funding, close-speed, or indefinite-hold claim is introduced.
- The gallery and preview shells collect no data and execute no third-party JavaScript.
- Prototype scripts and styles are served only from same-origin public paths. Existing external font stylesheets may retain their resilient local/system fallbacks.
- All gallery and design-review routes remain `noindex, nofollow`; this review surface is not a replacement for the launch-gated public marketing configuration.
- No credential or access token is written to source, Git history, logs, or remote URLs.

## Responsive, Interaction, and Accessibility Requirements

- Gallery panels work at 320px, 390px, tablet, 1440px, and wide desktop sizes without horizontal overflow.
- The gallery uses semantic `header`, `main`, and link structures, one `h1`, logical focus order, and a visible-on-focus skip link.
- Panel links and the `All designs` control are fully keyboard operable with strong `:focus-visible` treatment.
- Each iframe has a unique accessible title naming its design.
- Gallery thumbnails include concise alternative text and explicit dimensions to avoid layout shift.
- Preview loading has a neutral background; a missing or failed preview never hides the parent `All designs` link.
- Motion is limited to a short panel/route transition and removed under `prefers-reduced-motion`.

## Source and Component Boundaries

Expected implementation units:

- `src/data/designs.ts` — the single ordered design registry: slug, name, descriptor, thumbnail, and content URL.
- `src/layouts/DesignGalleryLayout.astro` — metadata, skip link, and neutral gallery document shell.
- `src/components/design-gallery/DesignCard.astro` — one semantic clickable panel.
- `src/components/home/LeatherHomepage.astro` — the unchanged rendered content previously owned by the root page.
- `src/pages/index.astro` — the design gallery.
- `src/pages/designs/[slug].astro` — the validated full-viewport preview shell.
- `src/pages/design-content/hyperboards.astro` — the leather homepage preview content.
- `public/design-previews/<slug>/` — deployable mirrors for the five standalone concepts.
- `public/design-thumbnails/` — generated local gallery thumbnails.
- `scripts/sync-design-previews.mjs` — deterministic prototype-to-public synchronization.
- `tests/design-gallery.test.mjs` — source and publishing contracts.
- Browser QA updates covering the gallery and all six preview routes.

Unknown slugs return the normal 404 response. The design registry is the only routing allowlist; no user-provided path is interpolated into filesystem access.

## Verification and Acceptance

The change is complete only when:

1. `/` presents exactly six clickable designs in the approved order.
2. Every panel opens the correct latest design at full viewport size.
3. `All designs` remains extremely small, fixed in the top-left, keyboard accessible, and available throughout each framed preview journey.
4. Hyperboards Original renders identically to the current approved leather site except for the revised navy saddle stitching inside its gold primary CTAs.
5. The five public prototype mirrors match their canonical source files byte-for-byte.
6. Gallery and previews have no horizontal overflow, serious or critical accessibility failures, broken local assets, uncaught console errors, or unsupported business claims.
7. Desktop and mobile screenshots are captured for the gallery and every preview.
8. `npm test`, content checks, Astro check/build, material UI tests, and design-gallery browser QA all pass.
9. The final committed state is pushed to `origin/main` without embedding credentials.
