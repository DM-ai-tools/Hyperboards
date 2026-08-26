# Hyperboards Atelier Casework Design Specification

**Status:** Approved on 2026-08-26  
**Scope:** Site-wide visual system refinement for the existing Hyperboards direct-acquirer website  
**Primary objective:** Make the interface more distinctive, tactile, and memorable without weakening the professional buyer positioning, accessibility, or performance.

## 1. Design Thesis

Atelier Casework combines the material restraint of a private leather folio with the information discipline of a transaction ledger. It is not a literal purse or luggage simulation. Leather grain, ivory saddle stitching, brass fittings, paper inserts, and debossed rules act as a coherent hierarchy system:

- navy leather identifies primary institutional surfaces;
- warm paper identifies readable information surfaces;
- brass identifies action, sequence, and precision;
- ivory stitching communicates craft and containment;
- debossed rules and corner fittings create depth without ornamental clutter.

The implementation should feel 70% luxury atelier and 30% bookbinder's ledger. It must avoid costume-like trunk styling, glossy 3D rendering, glassmorphism, decorative stock imagery, or a different material treatment on every card.

## 2. Existing Brand Elements to Preserve

- Keep the current midnight, navy, warm paper, ivory, brass, slate, and forest palette.
- Keep Newsreader, Instrument Sans, and IBM Plex Mono.
- Keep the current editorial hierarchy, direct-buyer copy, page structure, semantic HTML, and route architecture.
- Keep all existing acquisition ranges, industries, disclaimers, and claim-safety rules unchanged.
- Keep the site server-rendered and progressively enhanced; no UI dependency or animation library is required.

## 3. Material System

### 3.1 Leather

Use locally served SVG noise blended over multi-stop navy gradients. Grain must be visible at normal brightness but must not reduce text contrast. The texture layer is decorative, non-interactive, and reused across the header, hero, page heroes, process band, CTA band, mobile menu, and footer.

### 3.2 Paper

Use a quieter local SVG grain with low opacity on paper sections, criteria surfaces, sector cards, and the inquiry sheet. Paper remains visually flat enough for extended reading.

### 3.3 Stitching

Ivory saddle stitching uses short repeated dashes with generous spacing. It appears on:

- the fixed viewport case frame;
- primary and dark-surface CTA underplates;
- hero artwork and major CTA folios;
- the acquisition profile folio;
- selected process and form frames.

Do not stitch every section or every ordinary text card.

### 3.4 Brass and Hardware

Brass remains the action color. Use restrained bevels, engraved-style inner rules, small rivets, number medallions, and corner guards. Hardware must never resemble clickable controls unless it is attached to an actual control.

## 4. Component Treatments

### Viewport frame

A fixed, pointer-events-none frame sits inside the viewport with a navy leather rail, a brass outer hairline, and an ivory stitched inner line. Desktop corners receive small brass guard shapes and rivets. On screens below 480px, the rail narrows and corner hardware is reduced so it cannot obscure content or focus outlines. The frame must not cover the scrollbar.

### Header and navigation

The header becomes a slim leather rail with a shallow lower seam. The active navigation item uses a brass tooling line. The buyer badge becomes a small engraved label. The mobile menu inherits the leather surface and maintains its existing keyboard behavior.

### Buttons and conversion plates

Primary CTAs appear as brass plaques mounted into navy leather underplates with ivory stitching in the underplate. Secondary dark-surface CTAs use a stitched leather plate. Pressing a control moves it 1px to 2px with a reduced shadow; hover lifts it no more than 2px. Focus indicators remain clearly outside the material decoration.

### Hero and page heroes

The homepage hero keeps its editorial composition and business-transition illustration. The illustration is reframed as an embossed case insert with stitched perimeter, brass corner hardware, and a small maker's plate. Page-hero monograms become debossed/tooled case labels. Texture may not interfere with headings.

### Acquisition profile

The criteria band becomes a paper data sheet mounted in a shallow leather folio. Its four values retain their current responsive grid and receive fine ledger rules and compact brass fasteners.

### Seller-role plaque

The “Not an investment bank / broker / adviser” declaration becomes a dark stitched leather plaque. Its final buyer statement is highlighted in brass or ivory without changing the copy.

### Principles and sectors

Principles use bookbinder-style paper panels with debossed divisions. Sector entries become individual paper cards with shallow edge depth, brass number medallions, and a single tooled corner detail. They remain a semantic ordered list and reflow to one column on mobile.

### Process

The five process steps become a continuous leather desk folio divided by stitched/debossed seams. Brass medallions establish sequence. Desktop columns remain readable; mobile returns to a vertical ledger.

### Forms and informational notes

The inquiry form becomes a warm paper sheet inside a navy leather folio frame. Inputs remain simple, high-contrast, and familiar. Decorative stitching cannot overlap labels, validation summaries, or fields.

### CTA band and footer

The final conversion area becomes the strongest casework composition: leather field, stitched folio inset, brass CTA plaque, and restrained corner fittings. The footer uses a darker leather surface and subtle top seam.

## 5. Motion

- Existing reveal motion remains the primary page motion.
- Buttons use 180ms lift/press feedback.
- Brass can use a very restrained highlight shift on hover.
- A short stitch-draw or opacity reveal may occur once as a decorative enhancement.
- No parallax, WebGL, animated grain, autoplay video, or constant shimmer.
- `prefers-reduced-motion: reduce` disables decorative transitions and animations.

## 6. Accessibility and Performance

- Preserve WCAG AA contrast and the existing 3px focus indicator.
- All material layers use `aria-hidden="true"` or CSS pseudo-elements and `pointer-events: none`.
- Touch targets remain at least 44px.
- No horizontal overflow from 320px through 1920px.
- Grain assets are local SVG files and should remain below 10KB each.
- No new runtime dependencies, remote fonts, or stock imagery.
- The site remains useful with JavaScript disabled.

## 7. Verification Standard

The redesign is accepted only when:

- content and buyer-positioning tests pass;
- `astro check` reports zero errors;
- production build succeeds;
- every route returns the expected status with one H1 and no horizontal overflow;
- automated WCAG checks return no violations;
- mobile navigation and form/API contracts continue to work;
- screenshots at 320, 390, 768, 1024, 1440, and 1920 demonstrate a consistent material system;
- hero, sectors, process, contact form, and final CTA receive manual visual review;
- reduced-motion and no-JavaScript modes remain usable.

## 8. Non-Goals

- No content rewrite, CMS, authentication, investor portal, or backend expansion.
- No unverified transaction proof, logos, testimonials, or capital claims.
- No redesign of the established palette or typography.
- No literal photographic leather background or copied luxury-brand asset.
