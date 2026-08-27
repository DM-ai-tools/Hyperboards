# Hyperboards Frontpage Concepts V2 Expansion Design

**Date:** 2026-08-27  
**Status:** Approved in chat  
**Scope:** Refine Evergreen Partner and add two standalone front-page prototypes.

## Purpose

Produce three production-quality evaluation surfaces that make Hyperboards unmistakably a direct prospective buyer of established businesses. The work must raise visual craft, typography, cohesion, and useful interaction without introducing decorative clutter, unsupported commercial claims, or broker/adviser positioning.

The approved Astro homepage and the first-round prototypes remain out of scope. `02-cobalt-standard` remains available for comparison and is not rewritten.

## Audience and Job

The primary audience is an established U.S. business owner considering a confidential sale. In the first viewport, the owner must be able to answer three questions:

1. Is Hyperboards itself the prospective buyer?
2. Is my business roughly within the acquisition profile?
3. Is there a private, low-pressure way to start a conversation?

Aligned capital partners are secondary and appear only as a quiet footer contact.

## Shared Content Contract

Every concept must:

- State that Hyperboards buys businesses directly and is not an investment bank, broker, or adviser.
- Show `$750K–$2M` target EBITDA and `$2M–$6M` typical deal value.
- Include the nine approved sectors.
- Use `Discuss selling your business` as the primary CTA and `See what we acquire` as the secondary CTA.
- Describe published ranges as guidelines, not offers, valuations, or financing commitments.
- Avoid claims about completed deals, assets under management, permanent capital, guaranteed funding, closing speed, guaranteed outcomes, or indefinite ownership.
- Preserve useful content and navigation with JavaScript disabled.

## Concept 01: Evergreen Partner — Quiet Authority

### Intent

Refine, not reinvent, the existing concept. It should feel like a highly considered family-office briefing: warm, private, assured, and materially precise.

### Visual System

- Palette: deep evergreen, moss, warm limestone, paper, oxidized copper, and green-tinted charcoal.
- Typography: Literata for editorial display and Schibsted Grotesk for body/interface text. The contrast should feel cultivated without becoming literary or ornamental.
- Surfaces: flatter than cards, with layered paper planes, hairline rules, controlled shadows, and rare copper details.
- Rhythm: preserve the existing page order while creating stronger transitions between owner relationship, acquisition profile, process, and stewardship.

### Added Sub-elements

- A compact section index that marks the current part of the page.
- A refined acquisition dossier in the hero with a confidentiality/status line and clearer grouping.
- Small evidence labels and contextual annotations around acquisition criteria.
- An interactive sector ledger that reveals a concise demand rationale through accessible buttons.
- A process progress line that advances as each stage enters view.
- A stewardship register that connects people, customers, continuity, and context without introducing claims.

### Motion

The signature motion is the section index and process line advancing with scroll. Entrance motion uses a single restrained reveal system. Sector selection and FAQ disclosure provide immediate state feedback. No continuous decorative animation.

## Concept 03: Blackline Office — Monochrome Precision

### Intent

A near-black and warm-white acquisition office built on Swiss editorial discipline. It should feel exact, sober, decisive, and unmistakably businesslike while delivering the richest interaction of the three concepts.

### Visual System

- Palette: warm white, carbon, graphite, fog, and no chromatic accent.
- Typography: Archivo for display and Public Sans for body/interface text.
- Composition: strict twelve-column grid, asymmetric headlines, full-width rules, alternating paper and carbon fields, and deliberate negative space.
- Details: no gradients, generic cards, glass, illustrations, or decorative financial charts.

### Interaction Model

- A numbered left-side section navigator updates as the visitor scrolls.
- A `Mandate desk` lets visitors select Earnings, Demand, Transferability, or Relationship and updates an adjacent criteria brief. It is explanatory only and does not score or collect data.
- The nine-sector matrix supports keyboard and pointer focus, revealing concise demand context.
- Process stages use a horizontal track on desktop and an accessible stacked sequence on small screens.
- Navigation and disclosures remain native, keyboard operable, and functional without motion.

### Motion

The signature moment is a first-load line-and-type composition that resolves into the acquisition proposition. Scroll changes the active index, criteria focus, and process track through transform and opacity only. Pointer movement may create subtle local parallax within the mandate desk, but must stop for reduced motion and coarse pointers.

## Concept 04: Continuum House — Future Stewardship

### Intent

An original, forward-looking acquisition identity built around one continuous ownership path. It should be unconventional but calm: lucid, composed, and memorable rather than futuristic for its own sake.

### Visual System

- Palette: smoked plum, mineral white, stone-violet, and a rare vermilion signal.
- Typography: Geologica for expressive display and Noto Sans for body/interface text.
- Composition: one continuous path moves through offset content planes and connects proposition, criteria, sectors, process, and stewardship.
- Geometry: precise rounded cuts, quiet topographic lines, and large fields of negative space; no neon glow, blue-purple gradient, or floating glass cards.

### Interaction Model

- The hero contains an `Ownership path` instrument whose active point follows the current narrative section.
- A criteria lens reveals the four acquisition qualities through a rotating but non-looping focus state.
- Sectors appear as a single orbital index rather than a conventional card grid, with a readable list fallback on mobile and without JavaScript.
- Process stages progressively assemble into a single transfer line.
- The closing CTA resolves the path into a private-conversation marker.

### Motion

The signature motion is the ownership path progressing through the page. Motion is driven by scroll position and interaction, never time alone. Reveals are short, coordinated, and interruptible. Reduced-motion users receive all state changes instantly with the path rendered in its completed state.

## Responsive and Accessibility Requirements

- Support at least 390px mobile and 1440px desktop without horizontal overflow.
- Use semantic landmarks, exactly one `h1`, native buttons/details, and logical heading order.
- The skip link must be the first focusable element.
- Mobile navigation must be keyboard operable with correct `aria-expanded` state.
- All interaction states require visible focus indicators and must not depend on color alone.
- Core text must meet WCAG 2.2 AA contrast.
- Respect `prefers-reduced-motion`; no hidden content or running long animation may remain in reduced mode.
- No third-party JavaScript or owner-data form is permitted in these evaluation prototypes.

## Technical Structure

Each concept remains fully isolated in its folder with `index.html`, `styles.css`, and `script.js`. Classes, data attributes, tokens, and scripts use the concept namespace. The shared Node tests and Playwright/axe browser QA know about all four V2 concepts through declarative concept metadata.

New folders:

- `prototypes/frontpage-concepts-v2/03-blackline-office/`
- `prototypes/frontpage-concepts-v2/04-continuum-house/`

Modified folder:

- `prototypes/frontpage-concepts-v2/01-evergreen-partner/`

## Acceptance Criteria

1. Evergreen is visibly more polished while preserving its recognizable identity and content flow.
2. Blackline is strictly monochrome, cohesive, and interaction-rich without ornamental animation.
3. Continuum is visually distinct from every prior concept and communicates a continuous owner-to-buyer narrative.
4. All four V2 concepts pass source-contract tests, browser interaction checks, progressive-enhancement checks, reduced-motion checks, axe WCAG checks, and desktop/mobile screenshot capture.
5. `npm test`, `npm run qa:concepts:v2`, and `npm run build` pass.

