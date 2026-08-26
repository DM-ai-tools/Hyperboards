# Hyperboards Functional Folios — Internal Page Design Specification

**Date:** 2026-08-26
**Status:** Approved design direction; awaiting specification review
**Project:** Hyperboards direct-acquisition website

## 1. Objective

Redesign the internal pages so they no longer repeat the same `PageHero` composition or the same title-introduction rhythm. Each route will become a distinct, functional folio tailored to the visitor's immediate question while retaining the approved Hyperboards material language: navy leather relief, warm paper, fine saddle stitching, restrained brass hardware and editorial typography.

The homepage is frozen. Its markup, content hierarchy and visual composition must remain unchanged.

## 2. Positioning and content boundaries

Hyperboards remains a direct prospective buyer of established businesses. It is not presented as an investment bank, broker, sell-side adviser, course provider or certification business.

The homepage FAQ item “Is Hyperboards a broker or adviser?” remains because it directly reinforces this positioning. Its answer must continue to state that Hyperboards evaluates businesses as the prospective buyer and does not market them to third-party buyers.

Existing acquisition criteria remain unchanged:

- Target EBITDA: approximately $750K–$2M.
- Typical deal value: approximately $2M–$6M.
- Nine approved target sectors.
- Published figures remain guidelines, not offers or commitments.

No unsubstantiated transaction-history, assets-under-management, funding-capacity or team-experience claim may be introduced.

## 3. Experience concept: Functional Folios

Every primary internal page will feel like a different working document inside the same acquisition case. The experience should communicate that the visitor has opened the specific file relevant to their situation—not another version of the homepage.

Each folio receives:

1. A unique first-screen composition rather than the shared `PageHero` marker template.
2. One purposeful interactive module tied to the route’s job.
3. A route-specific motion signature.
4. Responsive behavior designed for the task rather than a scaled-down desktop layout.
5. The same accessibility, direct-buyer clarity and material-quality standards as the homepage.

## 4. Route designs

### 4.1 What We Acquire — “The Mandate Desk”

**Visitor question:** Does my company broadly fit?

The first screen becomes a horizontal acquisition mandate laid across a navy underwriting desk. The title occupies a paper dossier tab; the right side presents the four criteria as a compact scale rather than generic hero artwork.

The primary interactive module is a **Mandate Explorer**:

- Four selectable criteria tabs: EBITDA, deal value, role and geography.
- Selecting a criterion updates an adjacent explanation without changing the approved figures.
- A CSS range rail visually locates the published target range; it is explanatory and accepts no user-entered financial data.
- Keyboard-accessible tabs use proper tab semantics and visible focus states.

The nine sectors retain all approved text but appear as an indexed folio tray. Selecting or focusing a sector reveals its demand rationale in a shared detail panel rather than repeating identical tiles.

**Motion signature:** dossier tab settles into place; the range rail draws once; sector selection slides the detail sheet by a short transform-and-opacity transition.

### 4.2 For Business Owners — “The Transition Map”

**Visitor question:** What would a conversation and transition feel like for me?

The first screen becomes a private owner note paired with a stitched transition map. It leads with “speak directly with the buyer” and preserves the no-obligation message.

The primary interactive module is an **Owner Path Selector**:

- Three selectable starting positions: exploring, preparing and ready to discuss.
- Each state reveals a concise, non-prescriptive next-step explanation using existing approved content.
- It does not score, qualify or collect data.
- The existing complete-exit, phased-handover and continued-involvement options become an accessible comparison rail.

The acquisition process is shown as a progressive route with a clear active/focus state rather than the homepage’s repeated process-card component.

**Motion signature:** a brass route line reveals across the map; selection moves a physical-looking marker; content crossfades without layout-jumping.

### 4.3 Our Approach — “The Underwriting Lens”

**Visitor question:** How does Hyperboards evaluate a business and behave as a buyer?

The first screen becomes a split analyst folio. The direct-buyer statement is treated as the cover inscription; an animated aperture/lens diagram introduces the evaluation themes without implying automated scoring.

The primary interactive module is an **Underwriting Lens**:

- Eight approved review dimensions are arranged around a central business silhouette.
- Selecting a dimension reveals a brief contextual explanation derived only from existing page language.
- The module explicitly says the dimensions inform judgment and are not a formula or approval checklist.
- On small screens it becomes a semantic accordion/list rather than a compressed radial diagram.

The five operating principles become a vertically sequenced field memo with scroll/focus progression, not another card grid.

**Motion signature:** lens rings align on entry; the selected dimension rotates only a small indicator—not the text—and the corresponding memo fades into place.

### 4.4 About — “The Buyer’s Charter”

**Visitor question:** Who is Hyperboards, and what role does it actually play?

The first screen becomes an asymmetric charter with an embossed Hyperboards seal, the direct-acquirer definition and a concise role comparison.

The primary interactive module is a **Role Comparator**:

- Three columns/states: buyer, broker and adviser.
- Hyperboards is visibly and textually identified only with the buyer role.
- Selecting each role explains who evaluates, who represents the seller and who ultimately owns the acquisition decision.
- The comparison must remain factual, neutral and non-disparaging.

Values become clauses within a charter document rather than four equal tiles. Acquisition criteria appear as a compact mandate stamp linking to What We Acquire.

**Motion signature:** seal impression resolves on entry; charter clauses reveal in a restrained sequence; comparison-state changes use a sliding brass rule.

### 4.5 Contact — “The Confidential Intake”

**Visitor question:** What should I share, and is it safe to begin?

The first screen and form become one integrated intake composition. The introduction is brief; the working surface gives priority to the secure, server-validated inquiry form.

The primary interactive behavior is **Contextual Intake Guidance**:

- The existing form fields and server contract remain intact.
- A live, non-blocking guidance panel updates by field group: contact, business profile and message.
- Guidance explains what broad information is useful and what sensitive information not to submit.
- No client-side answer is treated as submitted until the existing server response succeeds.
- Existing validation, honeypot, rate limiting, size limit, same-origin check and webhook behavior remain unchanged.

The form may be visually grouped into three chapters but must remain a single-page form so users can scan all requested information and browser autofill continues to work.

**Motion signature:** the active chapter indicator advances on focus; guidance sheets crossfade; submission feedback remains immediate and reduced-motion safe.

### 4.6 Investor Relationships — “The Alignment Ledger”

**Visitor question:** Is there a disciplined basis for a private capital relationship?

This route remains deliberately quieter and continues to be `noindex`. The first screen resembles a private ledger rather than a seller-facing acquisition page.

The primary interactive module is an **Alignment Ledger**:

- Four relationship principles appear as selectable ledger entries.
- A shared detail pane explains the selected principle.
- The acquisition range is contextualized without implying an offering, allocation or financing commitment.
- The securities disclaimer stays prominent and unchanged in meaning.

**Motion signature:** ledger rows enter with subtle stagger; selection moves a narrow brass index marker; no celebratory or sales-like effects.

### 4.7 Privacy and Terms — “Document Readers”

These pages remain utility documents, not theatrical marketing experiences. They receive different reading structures:

- **Privacy:** a sticky contents rail with active-section tracking and a restrained reading-progress thread.
- **Terms:** a numbered clause ledger with expandable section summaries while all full text remains available in the DOM.

Interim/legal-review warnings remain prominent. No provisional language may be softened or hidden.

### 4.8 Thank You — “Review Receipt”

The generic hero is replaced by a compact receipt/acknowledgement panel confirming only that the introduction was accepted. The three next steps become a quiet review timeline. It must not promise a response time or transaction interest.

### 4.9 404 — “Route Index”

The missing-page screen becomes a physical index card pulled from the case, with three clear recovery routes. The interaction remains immediate, keyboard accessible and lightweight.

## 5. Shared component architecture

The repeated `PageHero` will no longer be used by the primary internal business pages. The homepage remains untouched and does not depend on it.

New shared primitives should provide consistency without making the folios look identical:

- `FolioShell.astro`: common material frame, semantic heading slot and optional folio index.
- `FolioLabel.astro`: restrained route label/metadata treatment.
- Route-specific modules: `MandateExplorer.astro`, `OwnerPathSelector.astro`, `UnderwritingLens.astro`, `RoleComparator.astro`, `IntakeGuidance.astro` and `AlignmentLedger.astro`.
- A small shared client script for intersection reveals and active-section tracking; each route module owns its semantic selection behavior.

Route-specific visual modules remain route-specific components when their semantics differ. Avoid a single over-configurable hero component with many cosmetic variants.

JavaScript must be progressive enhancement. Core content, links, form fields and legal text remain usable with JavaScript disabled.

## 6. Motion system

Motion supports orientation and feedback rather than spectacle.

- One signature entrance per route, 500–800ms.
- State transitions, 180–300ms.
- Stagger intervals, 70–110ms.
- Animate only `transform` and `opacity` for repeated interactions.
- Avoid bounce, elastic easing, scroll hijacking and continuous decorative movement.
- Respect `prefers-reduced-motion`; all information must be available in the static state.
- Interactive state must never depend on hover alone.

## 7. Responsive behavior

- Desktop layouts may use asymmetry, sticky working panels and side-by-side interactive views.
- Tablet layouts collapse decorative layers before reducing text or touch-target quality.
- Mobile layouts become linear working documents with 44px-minimum controls, visible state labels and no horizontal interaction requirement.
- Radial, rail and ledger modules receive explicit mobile alternatives rather than being visually shrunk.
- No route may introduce horizontal page overflow at 320px, 390px, 768px, 1024px or 1920px.

## 8. Accessibility and semantics

- One visible `h1` per route.
- Tabs use `tablist`, `tab`, `tabpanel`, roving keyboard behavior and correct selected state where tabs are appropriate.
- Accordions use native `details` where suitable or buttons with `aria-expanded` and controlled regions.
- Decorative diagrams are hidden from assistive technology; their information is repeated semantically.
- Focus styles remain visible over leather, paper and brass surfaces.
- Color is never the only indicator of selected state.
- All enhanced routes must pass the existing axe checks with no serious violations.

## 9. Content discipline

Existing approved copy should be reorganized, clarified or shortened only where repetition is removed. New explanatory text must not broaden the acquisition mandate or create operational/legal promises.

The homepage, acquisition ranges, sectors, exclusions, direct-buyer statements, legal disclaimers and inquiry safety guidance remain authoritative.

## 10. Testing and acceptance

Implementation is accepted only when all of the following are true:

1. The homepage has no intentional markup or visual changes.
2. The six primary business subpages no longer share the existing `PageHero` composition.
3. Each primary route has a visually and functionally distinct first screen and interaction.
4. Primary content remains available without JavaScript.
5. Keyboard, focus and reduced-motion behavior work on every interactive module.
6. The inquiry API and form-field contract remain unchanged.
7. Content-policy tests still enforce direct-buyer language and approved financial criteria.
8. Desktop and mobile screenshots confirm distinct compositions and no overflow.
9. Astro diagnostics, production build, content tests, material tests and browser QA pass.
10. No generated build output, local environment file, QA artifact or credential is committed.

## 11. Out of scope

- Homepage redesign.
- CMS, authentication, accounts or saved assessments.
- Automated valuation, fit scoring or investment recommendations.
- Multi-step data persistence or storing partial form entries.
- New business claims, transaction statistics or legal assertions.
- Third-party animation libraries or heavy client-side frameworks.
