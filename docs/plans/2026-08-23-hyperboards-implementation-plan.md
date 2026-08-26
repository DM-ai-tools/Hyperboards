# Hyperboards Website Implementation Plan

**Goal:** Deliver a polished standalone website that positions Hyperboards as a seller-first direct acquirer and converts qualified owners into confidential conversations.

## Phase 1 — Foundation

1. Initialize an Astro TypeScript application with Node server output.
2. Establish typed site configuration, navigation, acquisition criteria, sector data, FAQs, and process data.
3. Add environment documentation for canonical site URL and the private inquiry webhook.
4. Create a claims-safe content policy and keep unverified experience content disabled by default.

## Phase 2 — Design system

1. Implement primitive and semantic color tokens.
2. Add fluid typography, spacing, container, radius, border, shadow, and motion tokens.
3. Load local variable fonts through package dependencies.
4. Create reusable components for buttons, eyebrow labels, section headers, metric bands, sector rows, process steps, quotes, notices, and forms.
5. Build focus, hover, error, success, loading, and reduced-motion states.

## Phase 3 — Global shell

1. Create the document layout with SEO metadata, canonical URLs, Open Graph data, skip link, header, mobile navigation, footer, and privacy-aware analytics placeholder.
2. Implement an original Hyperboards monogram and wordmark in inline SVG/CSS.
3. Add restrained background geometry and operational line-work as lightweight local SVG assets.
4. Build consistent internal-page heroes and contextual calls to action.

## Phase 4 — Pages and content

1. Home: direct-buyer hero, criteria band, seller narrative, differentiators, sectors, process, stewardship, FAQ, and inquiry CTA.
2. What We Acquire: hard criteria, qualitative criteria, target sectors, exclusions, and opportunity submission CTA.
3. For Business Owners: owner concerns, confidentiality, transition options, first-call expectations, FAQs, and CTA.
4. Our Approach: five-stage journey, decision principles, diligence expectations, and post-close philosophy.
5. About: purpose, principles, relationship model, and accurate language about a family-office approach.
6. Contact: owner/referrer form, alternate guidance, privacy note, and response expectations.
7. Investor Relationships: intentionally quiet description and a general contact route.
8. Privacy, terms, 404, robots, and sitemap.

## Phase 5 — Inquiry system

1. Build a progressively enhanced form with accessible client-side feedback.
2. Add a server-side endpoint that accepts JSON or form data.
3. Validate required fields, email, URL, field lengths, role, industry, and EBITDA bands.
4. Reject honeypot submissions and excessive request volume.
5. Forward valid inquiries to `INQUIRY_WEBHOOK_URL` with a server-held bearer token when configured.
6. Return explicit success, validation, rate-limit, upstream, and configuration responses.
7. Never log full seller submissions or expose webhook credentials to the browser.

## Phase 6 — Quality and discoverability

1. Add page-specific titles and descriptions, structured Organization/Website data, canonical URLs, Open Graph metadata, and sitemap links.
2. Check heading order, landmarks, labels, focus order, menu behavior, live regions, color contrast, touch targets, and reduced motion.
3. Verify layout at 320, 390, 768, 1024, 1440, and 1920px.
4. Test internal links, form validation, API error contracts, no-JavaScript fallback, and 404 behavior.
5. Run type checking and production build.
6. Launch a local server and inspect rendered pages plus browser console/network output.
7. Capture representative desktop and mobile screenshots and perform a visual polish pass.

## Phase 7 — Handoff

1. Document local development, production build, deployment, and environment setup.
2. List the small set of manager-supplied facts still needed before launch: legal entity, team biographies, verified transaction-experience wording, operating geography, contact destination, privacy controller details, and approved domain.
3. Clearly separate “implementation complete” from “production launch ready” if external credentials or verified claims remain pending.

