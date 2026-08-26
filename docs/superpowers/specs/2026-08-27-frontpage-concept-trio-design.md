# Hyperboards Frontpage Concept Trio Design

## Purpose

Create three standalone homepage prototypes for design evaluation without modifying the approved Astro homepage or any existing route. Each prototype must communicate that Hyperboards is a direct buyer of established businesses, not an investment bank, broker, adviser, marketplace, or course provider.

## Audience and job

The primary visitor is an established U.S. business owner privately considering a sale. They need to understand the buyer's role, acquisition fit, process, and stewardship posture quickly enough to decide whether a confidential conversation is worthwhile. A secondary capital-partner audience may be acknowledged discreetly, never as the page's primary conversion path.

## Shared factual contract

All three concepts use the same approved facts so design—not claim selection—is being compared:

- Direct prospective buyer; never intermediary language.
- Target EBITDA: approximately `$750K–$2M`.
- Typical deal value: approximately `$2M–$6M`.
- Nine sectors: Building & Construction; Communication & Media; Entertainment & Recreation; Financial Services; Health Care & Fitness; Manufacturing; Online & Technology; Service Businesses; Wholesale & Distributors.
- Seller-first primary CTA: `Discuss selling your business`.
- Secondary CTA: `See what we acquire`.
- No unverified transaction history, fund size, assets-under-management, speed-to-close, guaranteed outcome, permanent-capital, or hold-period claims.
- Investor language remains brief and secondary.

## Prototype boundaries

- Location: `prototypes/frontpage-concepts/`.
- Three concept folders, each containing its own `index.html`, `styles.css`, and `script.js`.
- No imports from the existing Astro source or from another concept folder.
- The prototypes are evaluation artifacts; links may use meaningful local section anchors but must not submit or mutate live data.
- The existing homepage-owned source remains byte-for-byte untouched.
- Each page works when opened directly from disk and when served over HTTP.

## Concept 01 — Monumental Ledger

### Philosophy

A family-office annual report translated into a dynamic editorial object: measured, rigorous, and quietly monumental. The page should feel printed, ruled, and typeset rather than card-based.

### Visual system

- Dominant warm ivory field with midnight-navy typography and a rare vermilion seal accent.
- High-contrast editorial serif paired with a narrow humanist sans; neither may use the project's current Instrument/Newsreader/IBM Plex set.
- Asymmetric 12-column composition, oversized folio numbers, hairline rules, marginal annotations, and a circular acquisition seal.
- No leather, stitching, glass cards, generic metric tiles, or gradients in text.

### Signature motion

The hero ledger assembles on load: rules draw, folio marks register, and the acquisition seal rotates into alignment. Section annotations reveal on scroll. Motion uses transform and opacity only and collapses under `prefers-reduced-motion`.

## Concept 02 — Operator's Atlas

### Philosophy

An acquisition mandate expressed as an operating map: analytical but not financial-dashboard generic. It should suggest site plans, field notebooks, and industrial systems used by people who operate businesses.

### Visual system

- Dominant graphite-charcoal ground with bone text, mineral green, and a controlled safety-orange waypoint accent.
- Condensed grotesk display paired with a readable serif body.
- Coordinate grid, route geometry, sector compass, process topology, and an interactive acquisition-fit instrument.
- Geometry remains meaningful: paths correspond to actual process stages and sector markers correspond to approved sectors.

### Signature motion

A plotted acquisition path advances as the visitor scrolls; the fit instrument responds to pointer or keyboard selection without collecting information. Reduced motion presents the completed path immediately.

## Concept 03 — Quiet Cinema

### Philosophy

A restrained cinematic succession story: human, atmospheric, and emotionally confident without stock photography or luxury clichés. The composition treats the business as a body of work moving into its next chapter.

### Visual system

- Deep oxblood-black opening, limestone paper passages, muted copper, and ink-blue type.
- Broad sculptural sans display paired with a literary serif body.
- Masked light fields, typographic scene cuts, layered silhouettes derived in CSS/SVG, and a horizontal stewardship filmstrip.
- No generic hero photography, video dependency, lens-flare spectacle, or sentimental founder imagery.

### Signature motion

The opening title resolves through a slow aperture mask while a CSS/SVG light plane shifts subtly with pointer position. Subsequent sections use scene-cut transitions and a keyboard-operable stewardship filmstrip. Reduced motion removes tracking and reveals every scene statically.

## Shared interaction and accessibility requirements

- Semantic `header`, `nav`, `main`, `section`, and `footer` landmarks.
- One visible `h1`; logical heading hierarchy thereafter.
- Skip link, visible focus treatments, keyboard-operable controls, and minimum comfortable touch targets.
- Navigation remains usable at 320px without horizontal overflow.
- Progressive enhancement: all core copy and CTAs remain visible if JavaScript fails.
- `prefers-reduced-motion` disables nonessential motion; no autoplay audio or video.
- Decorative SVGs are hidden from assistive technology; meaningful interactive graphics have accessible names and state.
- Colors target WCAG AA contrast for text and controls.

## Performance constraints

- Plain semantic HTML, modern CSS, and dependency-free JavaScript.
- No framework runtime and no third-party animation library.
- Use CSS scroll-driven animation only inside `@supports`; IntersectionObserver is the compatible enhancement layer.
- Avoid large raster assets. Procedural CSS/SVG artwork is preferred.
- Animation work is limited to transform, opacity, clip-path, and SVG stroke properties.

## Evaluation criteria

Each concept must be clearly distinguishable in a side-by-side screenshot at a glance; state the buyer role in the first viewport; preserve approved ranges and sectors; provide a credible owner journey; remain polished at desktop and mobile sizes; and pass automated structure, content, overflow, keyboard, reduced-motion, and accessibility checks.
