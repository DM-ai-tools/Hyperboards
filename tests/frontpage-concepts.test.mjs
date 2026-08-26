import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const conceptsRoot = join(projectRoot, 'prototypes', 'frontpage-concepts');

const concepts = [
  {
    folder: '01-monumental-ledger',
    id: 'monumental-ledger',
    palette: ['--ledger-ink', '--ledger-paper', '--ledger-seal'],
    signature: ['acquisition-seal', 'ledger-rule'],
  },
  {
    folder: '02-operators-atlas',
    id: 'operators-atlas',
    palette: ['--atlas-graphite', '--atlas-mineral', '--atlas-waypoint'],
    signature: ['sector-compass', 'route-path'],
  },
  {
    folder: '03-quiet-cinema',
    id: 'quiet-cinema',
    palette: ['--cinema-oxblood', '--cinema-limestone', '--cinema-copper'],
    signature: ['aperture', 'scene-selector'],
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
  /\$2M\s*(?:to|-|–)\s*\$7M/i,
  /assets under management/i,
  /permanent capital/i,
  /guaranteed funding/i,
  /close(?:d|s)? in \d+ days/i,
  /\d+ deals? completed/i,
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
  test(`${concept.folder} is a complete, isolated direct-buyer prototype`, async () => {
    const source = await loadConcept(concept.folder);
    const readableHtml = source.html.replaceAll('&amp;', '&').replaceAll('&ndash;', '–');

    assert.match(source.html, new RegExp(`data-concept=["']${concept.id}["']`));
    assert.match(source.html, /<header\b/i);
    assert.match(source.html, /<nav\b/i);
    assert.match(source.html, /<main\b/i);
    assert.match(source.html, /<footer\b/i);
    assert.equal((source.html.match(/<h1\b/gi) || []).length, 1, 'exactly one h1 is required');
    assert.match(source.html, /skip[^<]*content/i);

    assert.match(source.html, /we (?:are|remain) the buyer|Hyperboards (?:is|buys as) the buyer/i);
    assert.match(source.html, /not (?:an? )?(?:investment bank|broker)/i);
    assert.match(source.html, /\$750K(?:&ndash;|–|-)\$2M/);
    assert.match(source.html, /\$2M(?:&ndash;|–|-)\$6M/);
    assert.match(source.html, /Discuss selling your business/i);
    assert.match(source.html, /See what we acquire/i);

    for (const sector of sectors) {
      assert.ok(readableHtml.includes(sector), `${concept.folder} is missing sector: ${sector}`);
    }

    for (const claim of unsupportedClaims) {
      assert.doesNotMatch(source.all, claim, `${concept.folder} contains unsupported claim ${claim}`);
    }

    for (const token of concept.palette) {
      assert.ok(source.css.includes(token), `${concept.folder} is missing visual token ${token}`);
    }
    for (const hook of concept.signature) {
      assert.ok(source.all.includes(hook), `${concept.folder} is missing signature hook ${hook}`);
    }

    assert.match(source.css, /prefers-reduced-motion:\s*reduce/i);
    assert.match(source.css, /:focus-visible/);
    assert.match(source.script, /IntersectionObserver|matchMedia/);
    assert.doesNotMatch(source.css, /background-clip:\s*text/i, 'gradient text is prohibited');
    assert.doesNotMatch(source.css, /border-(?:left|right):\s*[2-9]\d*px/i, 'thick side-stripe accents are prohibited');

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

test('the three concepts use distinct palettes and signature structures', async () => {
  const sources = await Promise.all(concepts.map(({ folder }) => loadConcept(folder)));
  const htmlClasses = sources.map(({ html }) => new Set([...html.matchAll(/class=["']([^"']+)["']/g)].flatMap((match) => match[1].split(/\s+/))));

  for (let i = 0; i < htmlClasses.length; i += 1) {
    for (let j = i + 1; j < htmlClasses.length; j += 1) {
      const shared = [...htmlClasses[i]].filter((name) => htmlClasses[j].has(name));
      assert.ok(shared.length < 12, `concepts ${i + 1} and ${j + 1} share too many structural classes: ${shared.join(', ')}`);
    }
  }
});
