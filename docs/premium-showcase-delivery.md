# Hyperboards Evergreen collection

> Historical delivery note: this collection has since been replaced by the nine-design approver and restored Evergreen homepage. See [current delivery](design-approver-release.md).

The three alternatives have been replaced following the user’s request for professional sites closer to the original Evergreen design. Design M opens the collection; Design 1 retains the supplied reference.

| Choice | Directory inside `Hyper boards DEMO` | Direction |
| --- | --- | --- |
| Design 1 | `design-1-original` | Evergreen Original |
| Design 2 | `design-2-atelier` | Stewardship: forest and ivory, acquisition mandate and ownership priorities |
| Design 3 | `design-3-meridian` | Corporate: navy and stone, structured acquisition brief and process |
| Design 4 | `design-4-fieldwork` | Ledger: warm charcoal and cream, organized ownership prospectus |

Existing directory names and URLs are retained so bookmarks immediately show the replacements. Open `Hyper boards DEMO/choose-design.html` locally, or visit https://hyperboards.com/.

## What changed

The replacements use the original’s serif/sans typography, criteria-led presentation and direct-buyer positioning. Acquisition panels, sector context, small line icons, operating principles and process diagrams give each section a business purpose. Type and section spacing are restrained. Oversized sculptures, tilted graphics and ornamental architectural heroes are removed.

Each design contains a home page, acquisition page and owner-introduction page, with self-hosted assets. The original seven root files remain untouched. The discreet return handle, responsive navigation, native FAQs, sector information, reduced-motion support and inquiry endpoint remain integrated.

The content authority is the supplied Evergreen reference. Financial guidelines remain target EBITDA $750K–$2M and typical deal value $2M–$6M. All nine industry categories and the original transaction stages are retained. No portfolio claims, performance figures or third-party track record are invented.

## Run and verify

Use Node 22.19 or newer in the repository root:

```sh
npm ci
npm run build
npm start
```

The server defaults to port 8080 and respects Railway’s `PORT`. `npm run sync:showcase` publishes source folders to `public/showcase`. `npm run capture:showcase` refreshes the chooser from real rendered pages. Set `QA_BASE_URL` when using a port other than the QA default, 4321.

```sh
npm test
npm run qa:showcase
```

Replacement evidence is saved under `artifacts/evergreen-replacement/`. QA covers all 12 pages at phone/tablet/desktop widths, accessibility, images, runtime errors, menus, keyboard controls, sector information, direct file opening and form responses intercepted locally. No real owner inquiries are sent during verification.

## Production

- Repository: `DM-ai-tools/Hyperboards`, `main`.
- Railway: `thriving-appreciation`, `production`, `Hyperboards`.
- Build: `npm run build`; start: `npm start`; default port 8080.
- Public hosts: https://hyperboards.com/ and https://hyperboards-production.up.railway.app/.
- Health marker: `evergreen-collection-2026-09-11` from `/api/health`.
- The GitHub-connected Railway pipeline deploys pushes to main. Existing DNS and email records are preserved.

Inquiry delivery uses the existing `INQUIRY_WEBHOOK_URL` and optional `INQUIRY_WEBHOOK_TOKEN`. Production had no webhook configured before this replacement. The redesign preserves honest server-error handling, retains entered information on failure and shows success only after server acceptance. Direct file opening supports browsing; actual form delivery requires a configured server.

## Replacement validation

- Final production build: 110 files checked, zero errors, warnings or hints.
- Existing application suite: 49 tests passed.
- Integrated responsive audit: all 12 pages at 390, 768 and 1440 pixels passed (36 page checks), with no overflow, broken images, runtime errors or reported accessibility violations.
- Final interaction run: 34 checks passed, covering the chooser, return control, navigation, disclosures, form response handling, local files and JavaScript-free browsing.
- Independent review: no outstanding substantive findings; six focused rechecks passed after correcting Ledger's server feedback and keyboard focus.
- All seven original reference hashes match. 120 comparisons confirm source, published and built files are identical.

Evidence is in `artifacts/evergreen-replacement/`, including `integrated/report.json` for the responsive matrix, `integrated/interaction-report.json` for the final interaction results, and `final-review.md`. The initial combined report's two interaction failures were corrected and superseded by the final 34-check run. GitHub deployment status and byte comparisons on both public hosts are recorded in `deployment.json` after release.
