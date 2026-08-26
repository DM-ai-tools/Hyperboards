# Hyperboards Launch Checklist

The site remains `noindex` and the inquiry endpoint fails honestly until launch configuration is supplied.

## Required before public launch

- [ ] Confirm the legal name and entity behind “Hyperboards.”
- [ ] Confirm that “family office” is an accurate approved public description.
- [ ] Confirm the final public domain and set `PUBLIC_SITE_URL`.
- [ ] Confirm the actual acquisition geography; the current public copy does not invent one.
- [ ] Confirm the private inquiry recipient and configure `INQUIRY_WEBHOOK_URL`.
- [ ] Decide whether the webhook requires `INQUIRY_WEBHOOK_TOKEN`.
- [ ] Run a real end-to-end owner inquiry and separately verify receipt.
- [ ] Replace the interim privacy page with counsel-approved terms naming the controller, purpose, retention, sharing, rights and contact route.
- [ ] Replace the interim website terms with counsel-approved terms for the operating entity and jurisdiction.
- [ ] Confirm whether investor-relationship wording requires securities counsel review.
- [ ] Approve the acquisition ranges, nine sectors and exclusions one final time.
- [ ] Decide whether the team’s $2M-$7M transaction experience can be substantiated and accurately attributed; it is not currently published.
- [ ] Add only real, permissioned team, portfolio or testimonial proof if supplied.
- [ ] Set `PUBLIC_INDEX_SITE=true` only after every item above is complete.

## Final release gate

```powershell
npm audit
npm run check
npm test
npm run test:content
npm run build
npm start
npm run qa:browser
```

- [ ] Confirm zero known dependency vulnerabilities.
- [ ] Confirm type check, tests and build all pass.
- [ ] Confirm the final browser QA report has no failures, console errors, page errors or request failures.
- [ ] Inspect desktop and mobile screenshots in `artifacts/screenshots/`.
- [ ] Verify production HTTPS, security headers, canonical URLs, sitemap and robots response.
- [ ] Verify the production inquiry without putting sensitive information in analytics, URLs or logs.

