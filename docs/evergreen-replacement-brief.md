# Evergreen-led replacement brief

The user rejected the three initial alternatives on 11 September 2026. Replace all three completely, taking the original Evergreen reference as the primary design authority. The seven original root files and Design 1 remain unchanged.

## Design acceptance

- Build professional acquisition websites for business owners and organizations. Each major element must explain Hyperboards' role, investment criteria, sector fit, transaction process, ownership approach, or the next action.
- Remove oversized abstract 3D graphics, ornamental architectural heroes, cinematic dark expanses, excessive type scale, and sections whose size is mostly empty space.
- Keep the Evergreen character: credible serif/sans pairing, neutral paper surfaces, disciplined borders and tables, restrained accent colours, substantive acquisition profile, clear hierarchy and discreet interaction.
- Populate layouts with useful criteria panels, sector-specific line icons, process diagrams, owner-priority lists, and operating principles. No invented transactions, growth charts, testimonials, staff, partner logos or performance figures.
- Use approximately 56–68px desktop hero type and 36–44px mobile type, 64–80px desktop section spacing and 40–48px mobile spacing. These are guidance, not rigid constraints. Avoid near-empty viewport-height heroes.
- All three designs need distinct composition while clearly belonging to the same professional reference family. Each must be a complete replacement, not a palette swap of the rejected work.

## Three directions

1. **Stewardship** — forest and ivory; closest to Evergreen. A compact two-column hero with a substantive acquisition mandate, ownership priorities and practical sector information.
2. **Corporate** — navy and stone; an institutional acquisition brief. Clear horizontal criteria, compact business-relevant modules and a restrained structured process.
3. **Ledger** — warm charcoal, cream and muted olive; a considered ownership prospectus. Organized rows, operating-principle diagrams and a clear owner-to-buyer path.

Retain existing directory URLs (`design-2-atelier`, `design-3-meridian`, `design-4-fieldwork`) so current chooser links and deployed bookmarks immediately serve the replacements. Update visible chooser names and thumbnails. Each folder contains the full new home, acquisition and owner-introduction pages and its own local assets.

## Content and functionality

Use `Hyper boards DEMO/index.html`, `what-we-acquire.html` and `sell-your-business.html` as content authorities. Retain direct prospective buyer positioning, target EBITDA $750K–$2M, typical deal value $2M–$6M, all nine sectors and their demand explanations, four process stages, stewardship and all five FAQ subjects. Treat financial ranges as guidelines, not offers or valuations.

Retain mobile navigation, keyboard/focus states, native FAQ toggling, all-sector explanations without JavaScript, reduced motion, and restrained reveals. The top-left return control remains subtle and expands on hover/focus. Parent integrates it with the existing publisher.

All owner forms must match `/api/inquiries`: `fullName`, `email`, optional `phone`, `company`, optional `companyWebsite`, `location`, `industry`, `ebitda`, `role`, `message` (20-character minimum), `acknowledgement` (value `true`), and `companyFax` honeypot. Keep `data-owner-form` and `data-form-status`. Send URL-encoded data with `Accept: application/json`. Show success only for both `response.ok` and `result.ok === true`; retain entries on failure; timeout requests. Never send real inquiries during QA. File-mode pages must explain that online delivery needs the server. Existing production webhook is unconfigured; this redesign must not claim delivery.

Use existing local font assets and licence files. Do not add dependencies or new runtime services. Preserve existing legal routes and the original reference. Parent owns chooser, synchronization, final inspection, tests, GitHub commit and Railway deployment.

## Validation and release

Inspect each design's desktop hero, lower sections, acquisition page and form, and phone layout. Check all 12 pages at phone, tablet and desktop widths, keyboard interactions, sectors, form outcomes using intercepted local requests, JS-off content and file launches. Refresh actual screenshots used in the chooser. Run the existing application tests and production build, then push main and verify both production hosts. Preserve DNS and MX records.
