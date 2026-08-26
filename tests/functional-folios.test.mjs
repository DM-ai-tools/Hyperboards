import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const frozenHomeFiles = new Map([
  ['src/pages/index.astro', 'ae51c4476877a9eff61fa6ac2705ab5a1ce0406ef127f9ffd25819a63cc2b9d6'],
  ['src/components/HeroArtwork.astro', 'f7cd2c53677768de55c7860fd59d6c737f02d511027b1229e238c854848a09a1'],
  ['src/components/CriteriaBand.astro', '1ca7bbadb992bbfcee6e85736a997f2785c227c595f99314c577dec49faeb456'],
  ['src/components/CtaBand.astro', '2e187cb634bfc21ecd7a54a69271fcace589bbbd833db28b5d1d375f96c6bdcb'],
  ['src/components/FaqList.astro', 'e6bd1235759f595e2b638f9aa321e0844f845322f667092529bec638bdaa6f59'],
  ['src/components/ProcessSteps.astro', 'b73f57b99dec3695a3268fd76da606e7a6d8b999e2bf6624e42c6412ee28d66f'],
  ['src/components/SectionIntro.astro', '7b8e11e96a326b5003e1387852490440d14b4bb1165af0ee208d828d77055709'],
  ['src/components/SectorGrid.astro', '73e6abd3f4491075b0e7c8cdbcdedf7094230c334519e6ff379acdc075daf785'],
  ['src/components/Header.astro', '146ea9b1452cd80a94bf7bf23b301210eb00df7ee18b6591cac6b84b0d0a7e69'],
  ['src/components/Footer.astro', 'd5988fdefa56cbc044625942e3396bad6e4342f0bb7fe99e763d2dc4f006568a'],
  ['src/styles/global.css', '9b0e05f190f35a228d2a705530d69b1cb986d37321be94d296a52ea6ba45d4cd'],
]);

test('homepage-owned source remains byte-for-byte frozen during the folio redesign', async () => {
  for (const [file, expected] of frozenHomeFiles) {
    const source = (await readFile(file, 'utf8')).replaceAll('\r\n', '\n');
    const digest = createHash('sha256').update(source).digest('hex');
    assert.equal(digest, expected, file);
  }
});

test('shared folio foundation provides a semantic cover and keyboard-safe controller', async () => {
  const [shell, label, controls] = await Promise.all([
    readFile('src/components/folios/FolioShell.astro', 'utf8'),
    readFile('src/components/folios/FolioLabel.astro', 'utf8'),
    readFile('src/scripts/folio-controls.ts', 'utf8'),
  ]);

  assert.match(shell, /data-folio-cover/);
  assert.equal((shell.match(/<h1/g) ?? []).length, 1);
  assert.match(shell, /<slot name="visual"/);
  assert.match(shell, /<slot name="actions"/);
  assert.match(shell, /prefers-reduced-motion/);
  assert.match(label, /folio-label/);
  assert.match(controls, /ArrowLeft/);
  assert.match(controls, /ArrowRight/);
  assert.match(controls, /Home/);
  assert.match(controls, /End/);
  assert.match(controls, /aria-selected/);
  assert.match(controls, /panel\.hidden/);
});

test('What We Acquire exposes the Mandate Desk instead of the repeated page hero', async () => {
  const [page, explorer] = await Promise.all([
    readFile('src/pages/what-we-acquire.astro', 'utf8'),
    readFile('src/components/folios/MandateExplorer.astro', 'utf8'),
  ]);

  assert.doesNotMatch(page, /PageHero/);
  assert.match(page, /MandateExplorer/);
  assert.match(page, /guidelines—not an automatic decision/);
  assert.match(explorer, /criteria/);
  assert.match(explorer, /sectors/);
  assert.match(explorer, /role="tablist"/);
  assert.match(explorer, /role="tab"/);
  assert.match(explorer, /role="tabpanel"/);
  assert.match(explorer, /aria-controls/);
  assert.match(explorer, /data-mandate-explorer/);
});

test('For Business Owners exposes an owner-controlled Transition Map', async () => {
  const [page, selector] = await Promise.all([
    readFile('src/pages/business-owners.astro', 'utf8'),
    readFile('src/components/folios/OwnerPathSelector.astro', 'utf8'),
  ]);

  assert.doesNotMatch(page, /PageHero/);
  assert.doesNotMatch(page, /ProcessSteps/);
  assert.match(page, /OwnerPathSelector/);
  assert.match(page, /directly with the prospective buyer/);
  assert.match(selector, /data-owner-path/);
  assert.match(selector, /key: 'exploring'/);
  assert.match(selector, /key: 'preparing'/);
  assert.match(selector, /key: 'ready'/);
  assert.match(selector, /Complete exit/);
  assert.match(selector, /Phased handover/);
  assert.match(selector, /Continued involvement/);
});

test('Our Approach presents a non-scoring Underwriting Lens', async () => {
  const [page, lens] = await Promise.all([
    readFile('src/pages/our-approach.astro', 'utf8'),
    readFile('src/components/folios/UnderwritingLens.astro', 'utf8'),
  ]);

  assert.doesNotMatch(page, /PageHero/);
  assert.match(page, /UnderwritingLens/);
  assert.match(page, /We are the buyer\. We do not represent the seller\./);
  assert.match(lens, /data-underwriting-lens/);
  assert.match(lens, /Quality and sustainability of earnings/);
  assert.match(lens, /Recurring and repeat revenue/);
  assert.match(lens, /Customer and supplier concentration/);
  assert.match(lens, /Management depth and owner dependence/);
  assert.match(lens, /Working-capital and capital-expenditure requirements/);
  assert.match(lens, /Competitive position and operational risks/);
  assert.match(lens, /Practical opportunities for future growth/);
  assert.match(lens, /transition required after closing/i);
  assert.match(lens, /inform judgment; they do not produce a score/i);
});

test('About distinguishes the direct buyer through a neutral Role Comparator', async () => {
  const [page, comparator] = await Promise.all([
    readFile('src/pages/about.astro', 'utf8'),
    readFile('src/components/folios/RoleComparator.astro', 'utf8'),
  ]);

  assert.doesNotMatch(page, /PageHero/);
  assert.match(page, /RoleComparator/);
  assert.match(page, /We buy businesses/);
  assert.match(page, /prospective buyer/);
  assert.match(comparator, /data-role-comparator/);
  assert.match(comparator, /label: 'Buyer'/);
  assert.match(comparator, /label: 'Broker'/);
  assert.match(comparator, /label: 'Adviser'/);
  assert.match(comparator, /aria-selected={index === 0/);
});

test('Contact preserves the inquiry contract inside a guided Confidential Intake', async () => {
  const [page, guidance, form] = await Promise.all([
    readFile('src/pages/contact.astro', 'utf8'),
    readFile('src/components/folios/IntakeGuidance.astro', 'utf8'),
    readFile('src/components/InquiryForm.astro', 'utf8'),
  ]);

  assert.doesNotMatch(page, /PageHero/);
  assert.match(page, /IntakeGuidance/);
  assert.match(page, /InquiryForm/);
  assert.match(page, /prospective buyer/);
  for (const field of [
    'fullName',
    'email',
    'phone',
    'company',
    'companyWebsite',
    'location',
    'industry',
    'ebitda',
    'role',
    'message',
    'companyFax',
    'acknowledgement',
  ]) {
    assert.match(form, new RegExp(`name=["']${field}["']`), field);
  }
  assert.match(guidance, /data-intake-guidance/);
  assert.match(guidance, /aria-live="polite"/);
  assert.match(guidance, /Do not include customer lists/i);
  assert.match(guidance, /focusin/);
});

test('Investor Relationships presents a discreet four-part Alignment Ledger', async () => {
  const [page, ledger] = await Promise.all([
    readFile('src/pages/investor-relationships.astro', 'utf8'),
    readFile('src/components/folios/AlignmentLedger.astro', 'utf8'),
  ]);

  assert.doesNotMatch(page, /PageHero/);
  assert.match(page, /AlignmentLedger/);
  assert.match(page, /noindex={true}/);
  assert.match(page, /\$750K–\$2M/);
  assert.match(page, /\$2M–\$6M/);
  assert.match(page, /This page is not an investment offering\./);
  assert.match(ledger, /data-ledger-row/);
  assert.equal((ledger.match(/title: '/g) ?? []).length, 4);
  assert.match(ledger, /Selective relationships/);
  assert.match(ledger, /Transaction by transaction/);
  assert.match(ledger, /Clear roles/);
  assert.match(ledger, /Seller confidentiality/);
});
