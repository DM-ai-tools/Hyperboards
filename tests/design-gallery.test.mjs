import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import test from 'node:test';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const expectedDesigns = [
  ['hyperboards', 'Hyperboards Original', '/design-content/hyperboards', false],
  ['evergreen-partner', 'Evergreen Partner', '/design-previews/evergreen-partner/index.html', false],
  ['evergreen-partner-refined', 'Evergreen Partner — Refined', '/design-previews/evergreen-partner-refined/index.html', true],
];

test('design registry exposes only the three approved previews in order', async () => {
  const moduleUrl = `${pathToFileURL(join(projectRoot, 'src', 'data', 'designs.ts')).href}?test=${Date.now()}`;
  const { designs, designBySlug } = await import(moduleUrl);

  assert.deepEqual(
    designs.map(({ slug, name, contentUrl, selected }) => [slug, name, contentUrl, Boolean(selected)]),
    expectedDesigns,
  );
  assert.equal(new Set(designs.map(({ slug }) => slug)).size, designs.length, 'design slugs must be unique');
  assert.equal(designBySlug('evergreen-partner-refined')?.name, 'Evergreen Partner — Refined');
  assert.equal(designs.filter(({ selected }) => selected).length, 1, 'exactly one design must be selected');
  assert.equal(designBySlug('blackline-office'), undefined, 'retired previews must not resolve');
  assert.equal(designBySlug('../private'), undefined, 'unlisted route input must not resolve');
});

test('preview publisher mirrors the latest canonical prototype bytes', async () => {
  const moduleUrl = `${pathToFileURL(join(projectRoot, 'scripts', 'sync-design-previews.mjs')).href}?test=${Date.now()}`;
  const { previewMappings, syncDesignPreviews } = await import(moduleUrl);
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'hyperboards-design-previews-'));

  try {
    const retiredPreview = join(temporaryRoot, 'blackline-office');
    await mkdir(retiredPreview, { recursive: true });
    await writeFile(join(retiredPreview, 'index.html'), 'retired preview', 'utf8');

    const published = await syncDesignPreviews({ projectRoot, destinationRoot: temporaryRoot });
    assert.equal(published.length, 2);
    assert.deepEqual(published.map(({ slug }) => slug), expectedDesigns.slice(1).map(([slug]) => slug));
    await assert.rejects(access(retiredPreview), { code: 'ENOENT' }, 'retired previews must be removed from the published directory');

    for (const { source, slug } of previewMappings) {
      const files = slug === 'evergreen-partner-refined'
        ? ['index.html', 'styles.css', 'script.js', 'sell-your-business.html', 'what-we-acquire.html', 'inner-pages.css', 'inner-pages.js']
        : ['index.html', 'styles.css', 'script.js'];
      for (const file of files) {
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

test('selected design routes owner and acquisition calls to dedicated pages', async () => {
  const sourceRoot = join(projectRoot, 'prototypes', 'frontpage-concepts-v2', '05-evergreen-partner-refined');
  const [homepage, ownerPage, acquirePage] = await Promise.all([
    readFile(join(sourceRoot, 'index.html'), 'utf8'),
    readFile(join(sourceRoot, 'sell-your-business.html'), 'utf8'),
    readFile(join(sourceRoot, 'what-we-acquire.html'), 'utf8'),
  ]);

  assert.match(homepage, /href="sell-your-business\.html"[^>]*>Start a conversation/);
  assert.match(homepage, /href="sell-your-business\.html"[^>]*>Discuss selling your business/);
  assert.match(homepage, /href="what-we-acquire\.html"[^>]*>See what we acquire/);

  assert.match(ownerPage, /<form[^>]+action="\/api\/inquiries"[^>]+method="post"/);
  assert.match(ownerPage, /name="fullName"/);
  assert.match(ownerPage, /name="email"/);
  assert.match(ownerPage, /name="message"/);
  assert.match(ownerPage, /Preview only[^<]*messages are not transmitted/i);
  assert.match(ownerPage, /hello@hyperboards\.com/);

  assert.match(acquirePage, /\$750K[^<]*\$2M/);
  assert.match(acquirePage, /\$2M[^<]*\$6M/);
  assert.match(acquirePage, /Direct buyer/i);
  assert.match(acquirePage, /Building &amp; Construction/);
  assert.match(acquirePage, /Wholesale &amp; Distributors/);
});

test('runtime site mode separates the approver chooser from finalized Evergreen and the legacy gallery', async () => {
  const [homepage, page, layout, card] = await Promise.all([
    readFile(join(projectRoot, 'src', 'pages', 'index.astro'), 'utf8'),
    readFile(join(projectRoot, 'src', 'pages', 'designs', 'index.astro'), 'utf8'),
    readFile(join(projectRoot, 'src', 'layouts', 'DesignGalleryLayout.astro'), 'utf8'),
    readFile(join(projectRoot, 'src', 'components', 'design-gallery', 'DesignCard.astro'), 'utf8'),
  ]);

  assert.match(homepage, /process\.env\.HYPERBOARDS_SITE_MODE\s*===\s*['"]approver['"]/);
  assert.match(homepage, /\?\s*['"]\/showcase\/choose-design\.html['"]/);
  assert.match(homepage, /:\s*['"]\/design-previews\/evergreen-partner-refined\/index\.html['"]/);
  assert.match(homepage, /Astro\.redirect/);
  assert.match(page, /Selected homepage direction\./i);
  assert.match(page, /Design 3 is selected/i);
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

test('preview shell isolates each design behind one tiny persistent return tab', async () => {
  const source = await readFile(join(projectRoot, 'src', 'pages', 'designs', '[slug].astro'), 'utf8');

  assert.match(source, /getStaticPaths/);
  assert.match(source, /designs\.map/);
  assert.match(source, /title={`\$\{design\.name\} homepage preview`}/);
  assert.match(source, /src={design\.contentUrl}/);
  assert.match(source, /href="\/designs"/);
  assert.match(source, />All designs</);
  assert.equal((source.match(/<iframe\b/g) || []).length, 1);
  assert.equal((source.match(/class="all-designs"/g) || []).length, 1);
  assert.match(source, /min-height:\s*24px/);
  assert.match(source, /max-width:\s*90px/);
  assert.match(source, /top:\s*36px/);
  assert.match(source, /left:\s*clamp\(/);
  assert.match(source, /:focus-visible/);
});

test('project exposes dedicated browser QA for the published design gallery', async () => {
  const packageJson = JSON.parse(await readFile(join(projectRoot, 'package.json'), 'utf8'));
  const qaSource = await readFile(join(projectRoot, 'scripts', 'design-gallery-qa.mjs'), 'utf8');

  assert.equal(packageJson.scripts['qa:designs'], 'node scripts/design-gallery-qa.mjs');
  assert.match(qaSource, /`\$\{baseUrl\}\/designs`/);
  assert.match(qaSource, /evergreen-partner-refined\/index\.html/);
  assert.match(qaSource, /\/designs\/hyperboards/);
  assert.match(qaSource, /\/designs\/evergreen-partner/);
  assert.match(qaSource, /\/designs\/evergreen-partner-refined/);
  assert.doesNotMatch(qaSource, /\/designs\/(?:blackline-office|cobalt-standard|quiet-cinema|operators-atlas)/);
  assert.match(qaSource, /axeCore\.source/);
  assert.match(qaSource, /all-designs/);
});
