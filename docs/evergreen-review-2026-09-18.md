# Evergreen review corrections

## Scope

The approved Evergreen theme, fonts, financial ranges, and direct-buyer positioning remain intact. The canonical source is `prototypes/frontpage-concepts-v2/05-evergreen-partner-refined/`; the build mirrors its assets to production and the existing design preview.

- Prose uses proportional punctuation. The global tabular-numeral feature had widened the comma and period glyphs; tabular figures are now limited to financial displays.
- Sentence em dashes have spaces on both sides. Compound words and numeric ranges are unchanged.
- All nine industries on the acquisition page are keyboard-operable selectors with visible, announced one-line descriptions.
- Process dividers align with circle centers and have equal lengths. Stewardship dividers are compact and centered. A duplicated margin above that row was removed.
- The owner introduction form has three groups, required-field validation, protected submission states, and a direct-email alternative.
- A neutral buyer comparison is integrated into the existing owner section. Content inspiration: https://tiny.com/ (reviewed September 18, 2026). No Tiny copy, deal promises, track record, permanent-capital claims, or categorical criticisms of other buyers were adopted.

## Inquiry delivery

The live deployment did not have `INQUIRY_WEBHOOK_URL` configured at review time. Without that setting, the structured form prepares an email draft for the visitor to review and send. It explicitly states that nothing has been sent; it neither stores inquiries locally nor shows a false success message.

When a real receiving endpoint is configured in Railway using the existing `INQUIRY_WEBHOOK_URL` and optional `INQUIRY_WEBHOOK_TOKEN`, the production page automatically switches to online submission through `/api/inquiries`. Do not add secrets to source control. Delivery errors preserve the fields; only acknowledged delivery clears them. Actual receiving-system delivery still requires an end-to-end test once configured.

## Local comparison

`artifacts/review-2026-09-18/standard/` and `artifacts/review-2026-09-18/compact/` hold local snapshots of all three public pages. The compact version applies a factor of `0.8` to section whitespace and major inter-section gaps, preserving type sizes and control dimensions. These ignored artifacts are not deployed or committed.

Local links: `http://127.0.0.1:4322/standard/` and `http://127.0.0.1:4322/compact/`.

To reopen the saved local previews from the project root: `node artifacts/review-2026-09-18/preview.mjs --serve-only`.

## Verification

Run `npm run build`, then `npm start`, then set `QA_BASE_URL=http://127.0.0.1:8080` and run `npm test`. The review regression suite covers punctuation, industry selection, line alignment, form validation, draft output, delivery failure, and retry/success behavior. Screenshots and desktop/tablet/mobile accessibility results are saved in the local review folder.

Visual assessment: the existing type and color direction is coherent. The compact variant improves pacing without compressing reading lines or form fields. Standard spacing remains the published version so the alternative can be reviewed independently.
