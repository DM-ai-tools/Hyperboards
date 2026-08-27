import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import test from 'node:test';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const expectedDesigns = [
  ['hyperboards', 'Hyperboards Original', '/design-content/hyperboards'],
  ['evergreen-partner', 'Evergreen Partner', '/design-previews/evergreen-partner/index.html'],
  ['blackline-office', 'Blackline Office', '/design-previews/blackline-office/index.html'],
  ['cobalt-standard', 'Cobalt Standard', '/design-previews/cobalt-standard/index.html'],
  ['quiet-cinema', 'Quiet Cinema', '/design-previews/quiet-cinema/index.html'],
  ['operators-atlas', 'Operators Atlas', '/design-previews/operators-atlas/index.html'],
];

test('design registry exposes the six approved previews in order', async () => {
  const moduleUrl = `${pathToFileURL(join(projectRoot, 'src', 'data', 'designs.ts')).href}?test=${Date.now()}`;
  const { designs, designBySlug } = await import(moduleUrl);

  assert.deepEqual(
    designs.map(({ slug, name, contentUrl }) => [slug, name, contentUrl]),
    expectedDesigns,
  );
  assert.equal(new Set(designs.map(({ slug }) => slug)).size, designs.length, 'design slugs must be unique');
  assert.equal(designBySlug('blackline-office')?.name, 'Blackline Office');
  assert.equal(designBySlug('../private'), undefined, 'unlisted route input must not resolve');
});

test('preview publisher mirrors the latest canonical prototype bytes', async () => {
  const moduleUrl = `${pathToFileURL(join(projectRoot, 'scripts', 'sync-design-previews.mjs')).href}?test=${Date.now()}`;
  const { previewMappings, syncDesignPreviews } = await import(moduleUrl);
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'hyperboards-design-previews-'));

  try {
    const published = await syncDesignPreviews({ projectRoot, destinationRoot: temporaryRoot });
    assert.equal(published.length, 5);
    assert.deepEqual(published.map(({ slug }) => slug), expectedDesigns.slice(1).map(([slug]) => slug));

    for (const { source, slug } of previewMappings) {
      for (const file of ['index.html', 'styles.css', 'script.js']) {
        assert.deepEqual(
          await readFile(join(temporaryRoot, slug, file)),
          await readFile(join(projectRoot, source, file)),
          `${slug}/${file} must be byte-identical to its latest prototype source`,
        );
      }
    }
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test('root gallery delegates all six semantic links to one design-card component', async () => {
  const [page, layout, card] = await Promise.all([
    readFile(join(projectRoot, 'src', 'pages', 'index.astro'), 'utf8'),
    readFile(join(projectRoot, 'src', 'layouts', 'DesignGalleryLayout.astro'), 'utf8'),
    readFile(join(projectRoot, 'src', 'components', 'design-gallery', 'DesignCard.astro'), 'utf8'),
  ]);

  assert.match(page, /Choose a homepage direction\./i);
  assert.match(page, /designs\.map/);
  assert.match(page, /<DesignCard/);
  assert.doesNotMatch(page, /BaseLayout/);
  assert.equal((layout.match(/<main\b/g) || []).length, 0, 'the page owns the sole main landmark');
  assert.match(layout, /noindex, nofollow/);
  assert.match(layout, /Skip to design options/);
  assert.match(card, /<a\b/);
  assert.match(card, /href={`\/designs\/\$\{design\.slug\}`}/);
  assert.match(card, /loading={index === 0 \? 'eager' : 'lazy'}/);
  assert.match(card, /width="960"/);
  assert.match(card, /height="600"/);
});

test('gallery ships one optimized local thumbnail for every design', async () => {
  for (const [slug] of expectedDesigns) {
    const image = await readFile(join(projectRoot, 'public', 'design-thumbnails', `${slug}.webp`));
    assert.equal(image.subarray(0, 4).toString('ascii'), 'RIFF', `${slug} must be a WebP asset`);
    assert.equal(image.subarray(8, 12).toString('ascii'), 'WEBP', `${slug} must be a WebP asset`);
    assert.ok(image.length < 350_000, `${slug} thumbnail should stay below 350KB`);
  }
});
