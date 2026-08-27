import assert from 'node:assert/strict';
import test from 'node:test';
import {
  APPROVED_RANGES,
  APPROVED_SECTORS,
  BUYER_POSITIONING_REQUIREMENTS,
  PROJECT_ROOT,
  formatIssues,
  lintText,
  runContentCheck,
  verifyAcquisitionData,
  verifyBuyerPositioning,
} from '../scripts/check-content.mjs';

test('claims checker accepts the approved target ranges', () => {
  const copy = 'We target $750K–$2M in EBITDA and an approximately $2M–$6M typical deal value.';
  assert.deepEqual(lintText('approved-copy.astro', copy), []);
});

test('claims checker rejects unfinished and unsupported public claims', () => {
  const samples = [
    ['unfinished.astro', 'Lorem ipsum'],
    ['experience.astro', 'Our team handled transactions ranging from $2M to $7M.'],
    ['capital.astro', 'We offer permanent capital and guaranteed funding.'],
    ['count.astro', 'Hyperboards has closed 14 deals.'],
  ];

  for (const [file, copy] of samples) {
    assert.ok(lintText(file, copy).length > 0, `${file} should fail the claims policy`);
  }
});

test('acquisition-data checker requires the approved sectors and ranges', () => {
  const sectorRows = APPROVED_SECTORS.map((name) => `{ name: '${name}' },`).join('\n');
  const rangeRows = APPROVED_RANGES.map(({ value, label }) => `{ value: '${value}', label: '${label}' },`).join('\n');
  const validData = `export const criteria = [${rangeRows}];\nexport const sectors = [${sectorRows}];\nexport const exclusions = [];`;
  assert.deepEqual(verifyAcquisitionData(validData, 'fixture.ts'), []);

  const invalidData = validData.replace('Wholesale & Distributors', 'Wholesale & Distribution');
  assert.ok(verifyAcquisitionData(invalidData, 'fixture.ts').some((issue) => issue.code === 'sector-data-mismatch'));
});

test('buyer-positioning checker requires explicit direct-buyer language', () => {
  assert.ok(BUYER_POSITIONING_REQUIREMENTS['src/components/home/LeatherHomepage.astro']);
  assert.equal(BUYER_POSITIONING_REQUIREMENTS['src/pages/index.astro'], undefined);

  const validSources = Object.fromEntries(
    Object.entries(BUYER_POSITIONING_REQUIREMENTS).map(([file, messages]) => [file, messages.join('\n')]),
  );
  assert.deepEqual(verifyBuyerPositioning(validSources), []);

  const unclearSources = { ...validSources, 'src/components/home/LeatherHomepage.astro': 'We participate in acquisitions.' };
  assert.ok(verifyBuyerPositioning(unclearSources).some((issue) => issue.code === 'buyer-positioning-missing'));
});

test('project source passes the complete content policy', async () => {
  const issues = await runContentCheck(PROJECT_ROOT);
  assert.deepEqual(issues, [], `\n${formatIssues(issues)}`);
});
