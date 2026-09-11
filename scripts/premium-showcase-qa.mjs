import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import axe from 'axe-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { designs } from './sync-premium-showcase.mjs';

const base = (process.env.QA_BASE_URL || 'http://127.0.0.1:4323').replace(/\/$/, '');
const siteMode = process.env.QA_SITE_MODE || 'approver';
assert.ok(['approver', 'evergreen'].includes(siteMode), 'QA_SITE_MODE is approver or evergreen');
const output = resolve(process.env.QA_OUTPUT_DIR || 'artifacts/approver-release/browser-qa');
const widths = [390, 768, 1440];
const chooserPath = '/showcase/choose-design.html';
const staticDesigns = [
  'design-1-original',
  'design-2-corporate',
  'design-3-monumental-ledger',
  'design-4-operators-atlas',
  'design-5-quiet-cinema',
  'design-6-cobalt-standard',
  'design-7-blackline-office',
  'design-8-continuum-house',
];
assert.deepEqual(designs, staticDesigns, 'QA must cover the published static design manifest');

const homepages = [
  ...staticDesigns.map(slug => ({ slug, route: `/showcase/${slug}/index.html` })),
  { slug: 'design-9-hyperboards-original', route: '/design-content/hyperboards' },
];
const pageCases = homepages.flatMap(page => [
  page,
  ...(['design-1-original', 'design-2-corporate'].includes(page.slug)
    ? ['what-we-acquire.html', 'sell-your-business.html'].map(file => ({
      slug: page.slug,
      route: `/showcase/${page.slug}/${file}`,
    }))
    : []),
]);
assert.equal(pageCases.length, 13, 'nine homepages and four existing inner pages');

const report = {
  base,
  siteMode,
  startedAt: new Date().toISOString(),
  expectedDesigns: homepages.length,
  expectedRoutes: pageCases.length,
  pages: [],
  checks: [],
  accessibilityFindings: [],
  failures: [],
  interceptedWrites: [],
};
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });

async function check(name, run) {
  try {
    await run();
    report.checks.push({ name, pass: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    report.checks.push({ name, pass: false });
    report.failures.push({ name, message });
    console.error(`FAIL ${name}: ${message}`);
  }
}

async function safeContext(options = {}) {
  const context = await browser.newContext({ reducedMotion: 'reduce', serviceWorkers: 'block', ...options });
  // Every context intercepts writes before a page opens. QA never sends inquiries.
  await context.route('**/*', async route => {
    const request = route.request();
    const isInquiry = new URL(request.url()).pathname === '/api/inquiries';
    if (isInquiry || !['GET', 'HEAD'].includes(request.method())) {
      report.interceptedWrites.push({ method: request.method(), url: request.url() });
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, message: 'Local QA intercepted this request. No information was delivered.' }),
      });
      return;
    }
    await route.continue();
  });
  return context;
}

function watchPage(page) {
  const evidence = { errors: [], assetFailures: [] };
  const assetTypes = new Set(['document', 'stylesheet', 'script', 'image', 'font']);
  page.on('pageerror', error => evidence.errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400 && assetTypes.has(response.request().resourceType())) {
      evidence.assetFailures.push({ url: response.url(), status: response.status() });
    }
  });
  page.on('requestfailed', request => {
    const error = request.failure()?.errorText || 'request failed';
    if (assetTypes.has(request.resourceType()) && error !== 'net::ERR_ABORTED') {
      evidence.assetFailures.push({ url: request.url(), error });
    }
  });
  return evidence;
}

async function prepareScreenshot(page) {
  await page.evaluate(async () => {
    document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
    await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
    // Trigger existing reveal/lazy behavior without altering any design's CSS.
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(600, innerHeight - 100)) {
      scrollTo(0, y);
      await new Promise(requestAnimationFrame);
    }
    scrollTo(0, 0);
    await new Promise(requestAnimationFrame);
  });
}

async function inspectPage(page, item, width, evidence) {
  const response = await page.goto(`${base}${item.route}`, { waitUntil: 'networkidle' });
  assert.equal(response?.status(), 200, 'page responds successfully');
  await prepareScreenshot(page);
  await page.addScriptTag({ content: axe.source });
  const data = await page.evaluate(async () => {
    const audit = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
    });
    return {
      h1: document.querySelectorAll('h1').length,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      brokenImages: [...document.images]
        .filter(image => !image.complete || image.naturalWidth === 0)
        .map(image => image.src),
      violations: audit.violations.map(violation => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        nodes: violation.nodes.map(node => ({ target: node.target, summary: node.failureSummary })),
      })),
    };
  });
  const record = { ...item, width, ...data, ...evidence };
  report.pages.push(record);
  if (data.violations.length) {
    report.accessibilityFindings.push({
      route: item.route,
      width,
      note: 'Existing design accessibility findings; recorded separately from collection integration failures.',
      violations: data.violations,
    });
  }
  const filename = `${item.slug}-${item.route.split('/').pop().replace('.html', '')}-${width}.png`;
  await page.screenshot({ path: join(output, filename), fullPage: true });
  assert.equal(data.overflow, false, 'no horizontal page overflow');
  assert.deepEqual(data.brokenImages, [], 'all page images load');
  assert.deepEqual(evidence.assetFailures, [], 'page assets load without HTTP/network failures');
  assert.deepEqual(evidence.errors, [], 'no uncaught page JavaScript errors');
}

try {
  if (!process.env.QA_INTERACTIONS_ONLY) {
    for (const width of widths) {
      const context = await safeContext({ viewport: { width, height: 1000 } });
      for (const item of [...pageCases, { slug: 'chooser', route: chooserPath }]) {
        const page = await context.newPage();
        const evidence = watchPage(page);
        await check(`${item.route} @${width}`, () => inspectPage(page, item, width, evidence));
        await page.close();
      }
      await context.close();
      console.log(`Completed ${width}px layout, asset and accessibility evidence.`);
    }
  }

  const context = await safeContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await check(`${siteMode} root opens its intended landing page`, async () => {
    await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(new URL(page.url()).pathname, siteMode === 'approver'
      ? chooserPath
      : '/');
  });
  await check('Chooser exposes all nine destinations in order', async () => {
    await page.goto(`${base}${chooserPath}`, { waitUntil: 'networkidle' });
    const links = await page.locator('.design-card .preview').evaluateAll(elements =>
      elements.map(element => new URL(element.href).pathname));
    assert.equal(await page.locator('.design-card').count(), 9);
    assert.deepEqual(links, homepages.map(item => item.route), 'chooser order and destinations match all nine designs');
  });

  await check(`Health identifies ${siteMode} site mode`, async () => {
    const response = await page.goto(`${base}/api/health`);
    assert.equal(response?.status(), 200);
    const health = await response.json();
    assert.equal(health.ok, true);
    assert.equal(health.mode, siteMode);
    assert.equal(health.designs, siteMode === 'approver' ? 9 : 1);
  });

  for (const item of homepages) {
    await check(`${item.slug}: chooser link and keyboard return`, async () => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(`${base}${chooserPath}`, { waitUntil: 'networkidle' });
      const link = page.locator('.design-card .preview').nth(homepages.indexOf(item));
      await link.click();
      await page.waitForLoadState('networkidle');
      assert.equal(new URL(page.url()).pathname, item.route);
      const back = page.locator('.hb-design-return');
      assert.equal(await back.count(), 1);
      assert.equal(await back.evaluate(element => new URL(element.href).pathname), chooserPath);
      await back.focus();
      await page.waitForFunction(() => document.querySelector('.hb-design-return').getBoundingClientRect().width >= 180);
      assert.ok(await back.evaluate(element => element === document.activeElement));
      await back.press('Enter');
      await page.waitForURL(`**${chooserPath}`);
    });

    await check(`${item.slug}: existing mobile navigation`, async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${base}${item.route}`, { waitUntil: 'networkidle' });
      const toggle = page.locator('button[aria-controls][aria-expanded]:visible').first();
      if (!await toggle.count()) {
        report.checks.push({ name: `${item.slug}: no collapsible mobile control in the preserved design`, informational: true });
        return;
      }
      const controlledId = await toggle.getAttribute('aria-controls');
      const initial = await toggle.getAttribute('aria-expanded');
      await toggle.focus();
      await toggle.press('Enter');
      assert.notEqual(await toggle.getAttribute('aria-expanded'), initial, 'keyboard activation toggles navigation state');
      if (await toggle.getAttribute('aria-expanded') === 'true') {
        assert.ok(await page.locator(`[id="${controlledId}"]`).isVisible(), 'expanded navigation is visible');
      }
      await toggle.press('Enter');
      assert.equal(await toggle.getAttribute('aria-expanded'), initial, 'a second activation restores navigation state');
    });
  }
  await context.close();
} finally {
  await browser.close();
  report.finishedAt = new Date().toISOString();
  await writeFile(join(output, process.env.QA_INTERACTIONS_ONLY ? 'interaction-report.json' : 'report.json'), JSON.stringify(report, null, 2));
  if (!process.env.QA_INTERACTIONS_ONLY) {
    await writeFile(join(output, 'accessibility-findings.json'), JSON.stringify(report.accessibilityFindings, null, 2));
  }
}

const responsivePages = report.pages.filter(item => item.slug !== 'chooser').length;
console.log(`${responsivePages} responsive design-page checks; ${report.pages.filter(item => item.slug === 'chooser').length} chooser layouts; ${report.checks.filter(item => item.pass === true).length} checks passed; ${report.failures.length} failures.`);
console.log(`${report.accessibilityFindings.length} page/viewport accessibility records are reported separately. ${report.interceptedWrites.length} write requests were intercepted; no QA inquiry was delivered.`);
if (report.failures.length) process.exitCode = 1;
