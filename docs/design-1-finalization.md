# Design 1 finalized

Design 1 (Evergreen) is the selected production website. The default service serves the homepage directly at `/`, with `/acquisition-criteria` and `/sell-your-business` for the inner pages; the separate approver mode is retained for reviewing the collection. The approved homepage and acquisition-page design remain unchanged.

The user chose the existing `hello@hyperboards.com` email link for inquiries. The owner-introduction page now offers a direct email action, the visible address, and a short guide to a useful introduction. The unavailable web form and disabled chat demonstration have been removed from the selected design. Email opens the visitor's email app for them to compose and send; the website does not claim to have delivered a message. The other prototype designs and the existing inquiry API are preserved.

Before modifying website files, a Desktop backup was created and verified: full Git history, source for current commit `7e4e565` and pre-redesign commit `a84b34a`, current deployable build, published assets, and 98 successful live page/asset captures. The backup includes restore instructions and SHA-256 checksums. Railway account secrets/provider settings were not exported because that account is unavailable. Backup location and validation evidence are recorded locally in `artifacts/design-1-finalization/`.

Build with Node 22.19+ using `npm run build`; `npm start` serves finalized Evergreen. Existing GitHub-to-Railway deployment remains in use. No separate Railway service is created by this finalization.

Validation: 49 application tests passed. The selected production and preview pages passed 18 responsive checks at 390, 768 and 1440 pixels, with no overflow, broken images, runtime errors or accessibility findings. Five additional checks covered production navigation, selected-design status and email access without JavaScript. No email or inquiry was sent during verification.
