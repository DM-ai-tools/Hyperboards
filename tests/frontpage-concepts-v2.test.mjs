import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const conceptsRoot = join(projectRoot, 'prototypes', 'frontpage-concepts-v2');

const concepts = [
  {
    folder: '01-evergreen-partner',
    id: 'evergreen-partner',
    palette: ['--evergreen-900', '--limestone-100', '--copper-600'],
    components: [
      'evergreen-profile',
      'evergreen-owner-grid',
      'evergreen-sector-index',
      'evergreen-sector-ledger',
      'evergreen-process-line',
      'evergreen-buyer-band',
      'evergreen-mandate-band',
    ],
  },
  {
    folder: '02-cobalt-standard',
    id: 'cobalt-standard',
    palette: ['--cobalt-700', '--porcelain-50', '--terracotta-600'],
    components: ['cobalt-criteria-rail', 'cobalt-operating-field', 'cobalt-sector-index'],
  },
  {
    folder: '03-blackline-office',
    id: 'blackline-office',
    palette: ['--blackline-carbon', '--blackline-paper', '--blackline-fog'],
    components: [
      'blackline-mandate',
      'blackline-sector-matrix',
      'blackline-process-track',
      'blackline-signal-rail',
      'blackline-hero-register',
      'blackline-sector-response',
    ],
  },
  {
    folder: '04-continuum-house',
    id: 'continuum-house',
    palette: ['--continuum-plum', '--continuum-mineral', '--continuum-signal'],
    components: ['continuum-path', 'continuum-lens', 'continuum-sector-orbit'],
  },
];

const sectors = [
  'Building & Construction',
  'Communication & Media',
  'Entertainment & Recreation',
  'Financial Services',
  'Health Care & Fitness',
  'Manufacturing',
  'Online & Technology',
  'Service Businesses',
  'Wholesale & Distributors',
];

const unsupportedClaims = [
  /\$2M\s*(?:to|-|–|&ndash;)\s*\$7M/i,
  /assets under management/i,
  /permanent capital/i,
  /guaranteed funding/i,
  /close(?:d|s)? in \d+ days/i,
  /\d+ deals? completed/i,
  /we never sell/i,
  /hold (?:forever|indefinitely)/i,
];

const firstRoundSignatures = [
  'acquisition-seal',
  'ledger-rule',
  'sector-compass',
  'route-path',
  'aperture',
  'scene-selector',
];

async function loadConcept(folder) {
  const root = join(conceptsRoot, folder);
  const [html, css, script] = await Promise.all(
    ['index.html', 'styles.css', 'script.js'].map(async (name) => {
      const path = join(root, name);
      return [name, await readFile(path, 'utf8')];
    }),
  );

  return {
    root,
    html: html[1],
    css: css[1],
    script: script[1],
    all: `${html[1]}\n${css[1]}\n${script[1]}`,
  };
}

for (const concept of concepts) {
  test(`${concept.folder} ships a complete owner-facing acquisition homepage`, async () => {
    const source = await loadConcept(concept.folder);
    const readableHtml = source.html.replaceAll('&amp;', '&').replaceAll('&ndash;', '–');

    assert.match(source.html, new RegExp(`data-concept=["']${concept.id}["']`));
    assert.match(source.html, /<header\b/i);
    assert.match(source.html, /<nav\b/i);
    assert.match(source.html, /<main\b/i);
    assert.match(source.html, /<section\b/i);
    assert.match(source.html, /<details\b/i);
    assert.match(source.html, /<footer\b/i);
    assert.equal((source.html.match(/<h1\b/gi) || []).length, 1, 'exactly one h1 is required');
    assert.match(source.html, /skip[^<]*content/i);

    assert.match(readableHtml, /Hyperboards (?:is|remains) the buyer|we (?:are|remain) the buyer/i);
    assert.match(readableHtml, /not (?:an? )?(?:investment bank|broker)/i);
    assert.match(readableHtml, /\$750K(?:–|-)\$2M/);
    assert.match(readableHtml, /\$2M(?:–|-)\$6M/);
    assert.match(readableHtml, /Discuss selling your business/i);
    assert.match(readableHtml, /See what we acquire/i);

    for (const sector of sectors) {
      assert.ok(readableHtml.includes(sector), `${concept.folder} is missing sector: ${sector}`);
    }

    for (const claim of unsupportedClaims) {
      assert.doesNotMatch(source.all, claim, `${concept.folder} contains unsupported claim ${claim}`);
    }

    for (const token of concept.palette) {
      assert.ok(source.css.includes(token), `${concept.folder} is missing visual token ${token}`);
    }
    for (const hook of concept.components) {
      assert.ok(source.all.includes(hook), `${concept.folder} is missing component hook ${hook}`);
    }
    for (const signature of firstRoundSignatures) {
      assert.ok(!source.all.includes(signature), `${concept.folder} reuses first-round signature ${signature}`);
    }

    if (concept.id === 'evergreen-partner') {
      assert.doesNotMatch(source.all, /evergreen-section-index/, 'Evergreen must not render the dynamic side-dot rail');
    }

    assert.match(source.css, /prefers-reduced-motion:\s*reduce/i);
    assert.match(source.css, /:focus-visible/);
    assert.match(source.script, /IntersectionObserver/);
    assert.match(source.script, /matchMedia/);
    assert.doesNotMatch(source.html, /<script[^>]+src=["']https?:/i, 'third-party JavaScript is prohibited');
    assert.doesNotMatch(source.css, /background-clip:\s*text/i, 'gradient text is prohibited');
    assert.doesNotMatch(source.html, /<form\b/i, 'evaluation prototypes do not submit owner data');

    for (const target of source.html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
      const value = target[1];
      if (!value.startsWith('../')) continue;
      const resolved = resolve(source.root, value.split('#')[0]);
      assert.ok(
        !relative(conceptsRoot, resolved).startsWith('..') && dirname(resolved) === source.root,
        `${concept.folder} must not depend on another concept folder: ${value}`,
      );
    }
  });
}

test('all concepts use independent structural namespaces', async () => {
  const sources = await Promise.all(concepts.map(({ folder }) => loadConcept(folder)));
  const classSets = sources.map(({ html }) => new Set([...html.matchAll(/class=["']([^"']+)["']/g)].flatMap((match) => match[1].split(/\s+/))));
  for (let left = 0; left < classSets.length; left += 1) {
    for (let right = left + 1; right < classSets.length; right += 1) {
      const shared = [...classSets[left]].filter((name) => classSets[right].has(name));
      assert.ok(
        shared.length < 8,
        `${concepts[left].folder} and ${concepts[right].folder} share structural classes: ${shared.join(', ')}`,
      );
    }
  }
});
