> **September 2026:** the main website opens the finalized Evergreen template. The separate Design Approver contains nine existing designs, including the restored earlier Design 3 as Design 2. See [service setup](docs/design-approver-release.md) and [design sources](<Hyper boards DEMO/README.md>). Both services use port 8080 by default.

# Hyperboards Website

A standalone, seller-first website for Hyperboards as a direct acquirer of established businesses.

## Homepage design review

The root route is a private, noindex design chooser with six finalized homepage directions. Each panel opens a full-viewport isolated preview, and the compact `All designs` tab in the top-left returns to the chooser.

Published previews:

- Hyperboards Original
- Evergreen Partner
- Blackline Office
- Cobalt Standard
- Quiet Cinema
- Operators Atlas

The five standalone prototype mirrors are refreshed from their canonical folders before every production build:

```powershell
npm run sync:designs
```

With the site running locally, refresh the gallery thumbnails or verify every preview at desktop and mobile sizes:

```powershell
npm run capture:design-thumbnails
npm run qa:designs
```

## What is included

- Homepage plus five primary pillar pages
- Footer-level investor-relationships page
- Acquisition profile for $750K-$2M EBITDA and typical $2M-$6M deal value
- All nine approved sectors and current exclusions
- Responsive Quiet Stewardship design system
- Accessible desktop and mobile navigation
- Progressive-enhancement inquiry form
- Server-side validation, honeypot protection, rate limiting and private webhook forwarding
- Noindex-by-default launch guard
- Canonical metadata, Open Graph data, organization schema, robots and sitemap
- Explicitly provisional privacy and terms pages
- Content-policy tests and cross-viewport browser QA

## Requirements

- npm 9.6.5 or newer
- The project declares Node 22.19 or newer and includes a project-local Node 22 runtime for this Windows environment. npm may print an engine warning during the first install when the host Node is older; project scripts resolve the local runtime after installation.

## Local setup

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Open `http://localhost:4321`.

## Production build

```powershell
npm run check
npm test
npm run test:content
npm run build
npm start
```

The Node adapter writes the deployable server to `dist/`. The production start command runs `dist/server/entry.mjs`.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PUBLIC_SITE_URL` | Before launch | Final canonical public origin, for example `https://hyperboards.com` |
| `PUBLIC_INDEX_SITE` | Before launch | Keep `false` until legal, claims, domain and form delivery are approved; set to `true` for production indexing |
| `INQUIRY_WEBHOOK_URL` | For live inquiries | Private HTTPS endpoint that accepts the validated inquiry JSON |
| `INQUIRY_WEBHOOK_TOKEN` | Optional | Server-side bearer token sent to the webhook |

The private webhook values are read by the Node server at runtime. They are never exposed to browser code.

### Webhook payload

```json
{
  "type": "acquisition-inquiry",
  "receivedAt": "2026-08-23T12:00:00.000Z",
  "source": "hyperboards-website",
  "inquiry": {
    "fullName": "...",
    "email": "...",
    "phone": "...",
    "company": "...",
    "companyWebsite": "...",
    "location": "...",
    "industry": "manufacturing",
    "ebitda": "1m-2m",
    "role": "owner",
    "message": "...",
    "acknowledgement": true
  }
}
```

A 2xx response confirms delivery. If the endpoint is absent, times out or rejects the request, the website explicitly tells the visitor that delivery did not occur.

## Verification

With the production server running on port 4321:

```powershell
npm run qa:browser
```

This verifies all public routes, single-H1 structure, desktop overflow, critical journeys at 320/375/768/1024/1920px, mobile-menu keyboard behavior, no-JavaScript access, 404/robots/sitemap/favicon, and inquiry API error contracts. Screenshots and the machine-readable report are written to `artifacts/`.

## Content and claim guardrails

Do not publish any transaction count, portfolio, capital figure, closing guarantee, permanent-capital statement, testimonial, team credential or historical deal claim without substantiation and approval.

The proposed statement “Our team has handled transactions ranging from $2M-$7M” is intentionally absent from the public UI. If later approved, it must accurately describe the team’s role and must not imply that Hyperboards completed transactions it did not complete.

## Launch status

The implementation is complete and verified locally. It is intentionally not production-launch-ready until the decisions in [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) are resolved.
