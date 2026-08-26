import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the project exposes a dedicated browser QA command for all three concept routes', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const qaSource = await readFile(new URL('../scripts/frontpage-concepts-qa.mjs', import.meta.url), 'utf8');

  assert.equal(packageJson.scripts['qa:concepts'], 'node scripts/frontpage-concepts-qa.mjs');
  for (const route of ['01-monumental-ledger', '02-operators-atlas', '03-quiet-cinema']) {
    assert.ok(qaSource.includes(route), `browser QA must exercise ${route}`);
  }
  for (const viewport of ['desktop', 'mobile']) {
    assert.ok(qaSource.includes(viewport), `browser QA must capture ${viewport}`);
  }
  assert.match(qaSource, /axeCore\.source/);
  assert.match(qaSource, /scrollWidth/);
  assert.match(qaSource, /keyboard|\.press\(/i);
  assert.match(qaSource, /reducedMotion:\s*'reduce'/);
});
