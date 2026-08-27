# Hyperboards Professional Frontpage Duo Design

## Purpose

Create two standalone homepage prototypes that replace visual experimentation with a credible, production-ready acquisition-company presentation. The prototypes are evaluation artifacts only: they do not modify the approved Astro site or the existing three frontpage studies.

## Audience and conversion job

The primary visitor is an established U.S. business owner privately considering a sale. Within the first viewport, the visitor must understand that Hyperboards is the prospective buyer, see the broad acquisition range, and know how to begin a confidential, low-pressure conversation. Investor relationships remain secondary and appear only as a discreet footer link or short supporting note.

## Reference synthesis

The designs use current official investment-firm websites as reference models without reproducing their identity, copy, proprietary imagery, or claims:

- Permanent Equity: owner-first language, clarity of purpose, and long-horizon editorial confidence.
- Chenmark: empathy for the owner's decision and a straightforward seller journey.
- PPC: restrained family-investment positioning and disciplined institutional tone.
- General Atlantic: clear contemporary hierarchy and a confident corporate grid.
- Alpine Investors: prominent founder-facing conversion path and direct call to action.

## Shared factual and copy contract

Both prototypes compare design using the same approved business facts:

- Hyperboards buys established, profitable businesses directly from their owners.
- Hyperboards is not an investment bank, broker, M&A adviser, marketplace, or course provider.
- Target EBITDA: approximately `$750K–$2M`.
- Typical deal value: approximately `$2M–$6M`.
- Target sectors: Building & Construction; Communication & Media; Entertainment & Recreation; Financial Services; Health Care & Fitness; Manufacturing; Online & Technology; Service Businesses; Wholesale & Distributors.
- Primary CTA: `Discuss selling your business`.
- Secondary CTA: `See what we acquire`.
- No claims about completed transactions, fund size, assets under management, guaranteed funding, permanent capital, closing speed, valuation outcomes, or hold period.
- Financial ranges are guidelines rather than promises or offers.

## Shared page narrative

Each page follows one continuous owner journey:

1. Direct-buyer hero with the primary action and concise acquisition profile.
2. Unambiguous role statement: buyer, not intermediary.
3. Owner-centered reasons to engage: direct access, discretion, flexible transitions, respect for the operating business.
4. Acquisition profile: financial guidelines, durable-business characteristics, and all nine sectors.
5. A simple four-stage conversation-to-transition process.
6. Stewardship principles covering people, customers, continuity, and context.
7. Practical FAQ and a repeated confidential-conversation CTA.
8. Compact corporate footer with secondary investor language.

Sections must feel causally connected; the end of each section should prepare the next. There are no disconnected slogans, arbitrary labels, invented quotations, ornamental diagrams, or animation-only ideas.

## Prototype 01 — Evergreen Partner

### Art direction

Evergreen Partner is a typography-led family-office presentation: calm, mature, and relational. It synthesizes Permanent Equity's owner orientation with PPC's restraint.

### Visual system

- Palette: deep evergreen, warm limestone, paper white, sage, and restrained oxidized-copper accents.
- Type: a sober neo-grotesk for navigation/body and a restrained editorial serif used only for major owner-focused statements.
- Composition: a consistent twelve-column desktop grid with one max-width, strong vertical rhythm, thin structural rules, and generous whitespace.
- Hero: left-aligned buyer proposition paired with a quiet acquisition-profile register. No illustration, seal, texture, or cinematic device.
- Components: flat surfaces, low-contrast section changes, purposeful dividers, and rare compact information panels. Avoid card walls.
- Buttons: solid evergreen primary and understated text-link secondary; both have clear focus and hover states.

### Motion

Motion is limited to short opacity/translate reveals for grouped content, header elevation on scroll, disclosure expansion, and button/link feedback. No looping animation, parallax, cursor tracking, drawn paths, counters, or autoplay sequence. Reduced motion renders all content immediately.

## Prototype 02 — Cobalt Standard

### Art direction

Cobalt Standard is a contemporary institutional homepage: precise, direct, and operational. It synthesizes General Atlantic's corporate confidence with Alpine's founder-facing conversion structure.

### Visual system

- Palette: saturated cobalt, graphite, porcelain, pale mineral blue, and a controlled terracotta action accent.
- Type: a clean Swiss-influenced sans family with a single readable weight range; hierarchy comes from scale, measure, and spacing rather than mixed display fonts.
- Composition: a disciplined eight-column grid, full-width color fields, and structured two-column sections that alternate information density without changing the alignment system.
- Hero: a large direct-buyer statement with a code-native operating-field composition made from simple lines, blocks, and type. The graphic communicates evaluation and continuity rather than pretending to be a chart.
- Components: a compact criteria rail, an orderly sector index, a numbered process, and high-contrast action bands. No glassmorphism, gradients, decorative icons, or generic stat cards.
- Buttons: terracotta primary and outlined cobalt secondary with unambiguous states.

### Motion

Motion is limited to a brief first-paint hero settle, active navigation underline, disclosure expansion, and small hover/focus transitions. No ambient movement or section choreography. Reduced motion removes all nonessential transitions.

## Standalone implementation boundary

- Root: `prototypes/frontpage-concepts-v2/`.
- Folders: `01-evergreen-partner/` and `02-cobalt-standard/`.
- Each folder contains `index.html`, `styles.css`, and `script.js` and does not import from the Astro application or the first-round concepts.
- The prototypes work from `file://` and from a local HTTP server.
- Local section anchors are functional. Email links may open a mail client but no form submits data.
- No third-party JavaScript or animation libraries.
- External font loading must include resilient system fallbacks; content remains fully legible when fonts are unavailable.

## Accessibility and interaction requirements

- Semantic `header`, `nav`, `main`, `section`, `details`, and `footer` landmarks/elements.
- Exactly one visible `h1` and a logical heading hierarchy.
- First keyboard target is a visible-on-focus skip link.
- All controls are keyboard operable and have at least a 44px comfortable target where practical.
- Visible `:focus-visible` treatment meets contrast requirements.
- Body text is at least 16px with comfortable line height and restrained line length.
- Text and controls target WCAG AA contrast.
- No content depends only on color, hover, animation, or JavaScript.
- Navigation collapses accessibly on narrow screens; `aria-expanded` reflects state.
- FAQ uses native `details` and `summary` elements.
- `prefers-reduced-motion` removes nonessential transitions and reveals all content.
- Layout has no horizontal overflow at 320px, 390px, 768px, 1024px, or 1440px.

## Performance and production constraints

- Plain HTML, CSS, and dependency-free JavaScript.
- No large raster assets, embedded video, framework runtime, or generated chart library.
- CSS uses a three-layer token system: primitives, semantic roles, and component tokens.
- Animation uses only transform and opacity outside native disclosure behavior.
- JavaScript is enhancement-only: mobile navigation, header state, current year, and IntersectionObserver reveal classes.
- Core content and all CTAs remain visible and usable with JavaScript disabled.

## Verification and acceptance

Both prototypes must:

- state the direct-buyer role and financial ranges in the first viewport on desktop;
- preserve all approved sectors and omit unsupported claims;
- look clearly distinct while sharing the same factual journey;
- avoid the first-round signatures: seals, coordinates, compasses, cinema/aperture treatments, textured material effects, and ornamental animation;
- pass automated source-contract tests;
- pass desktop and mobile browser checks for structure, overflow, keyboard navigation, reduced motion, console errors, and serious/critical axe violations;
- produce full-page desktop and mobile screenshots for visual review;
- leave `src/pages/index.astro` and the existing prototype folders unchanged.
