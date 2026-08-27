import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import axeCore from 'axe-core';
import { chromium } from 'playwright-core';

const baseUrl = (process.env.QA_BASE_URL || 'http://127.0.0.1:4321').replace(/\/$/, '');
const artifactRoot = resolve('artifacts', 'design-gallery');

const designs = [
  { slug: 'hyperboards', route: '/designs/hyperboards', name: 'Hyperboards Original' },
  { slug: 'evergreen-partner', route: '/designs/evergreen-partner', name: 'Evergreen Partner' },
  { slug: 'blackline-office', route: '/designs/blackline-office', name: 'Blackline Office' },
  { slug: 'cobalt-standard', route: '/designs/cobalt-standard', name: 'Cobalt Standard' },
  { slug: 'quiet-cinema', route: '/designs/quiet-cinema', name: 'Quiet Cinema' },
  { slug: 'operators-atlas', route: '/designs/operators-atlas', name: 'Operators Atlas' },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];

const failures = [];
const report = { gallery: [], previews: [], accessibility: [], screenshots: [], failures };

async function runAxe(target, label) {
  await target.addScriptTag({ content: axeCore.source });
  const violations = await target.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
      },
    });
    return result.violations.map(({ id, impact, help, nodes }) => ({
      id,
      impact,
      help,
      nodes: nodes.map((node) => node.target.join(' ')),
    }));
  });
  const serious = violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  report.accessibility.push({ label, violations });
  if (serious.length) failures.push(`${label} has serious axe violations: ${serious.map(({ id }) => id).join(', ')}`);
}

await mkdir(artifactRoot, { recursive: true });

let browser;
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const localResponseErrors = [];

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(String(error)));
    page.on('response', (response) => {
      if (response.url().startsWith(baseUrl) && response.status() >= 400) {
        localResponseErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    const galleryResponse = await page.goto(baseUrl, { waitUntil: 'networkidle' });
    const galleryContract = await page.evaluate(() => ({
      h1Count: document.querySelectorAll('h1').length,
      links: [...document.querySelectorAll('.design-card > a')].map((link) => ({
        name: link.querySelector('h2')?.textContent?.trim() || '',
        href: link.getAttribute('href'),
      })),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
    }));

    report.gallery.push({ viewport: viewport.name, status: galleryResponse?.status() || 0, ...galleryContract });
    if (galleryResponse?.status() !== 200) failures.push(`gallery ${viewport.name} returned ${galleryResponse?.status()}`);
    if (galleryContract.h1Count !== 1) failures.push(`gallery ${viewport.name} has ${galleryContract.h1Count} H1 elements`);
    if (galleryContract.overflow) failures.push(`gallery overflows horizontally at ${viewport.name}`);
    if (galleryContract.robots !== 'noindex, nofollow') failures.push(`gallery ${viewport.name} is missing noindex`);
    if (galleryContract.links.length !== designs.length) failures.push(`gallery ${viewport.name} exposes ${galleryContract.links.length} design links`);
    assertOrder(galleryContract.links.map(({ name }) => name), designs.map(({ name }) => name), `gallery ${viewport.name} order`);

    await page.keyboard.press('Home');
    await page.keyboard.press('Tab');
    const firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim() || '');
    if (!/skip to design options/i.test(firstFocus)) failures.push(`gallery ${viewport.name} does not focus the skip link first`);

    const firstCard = page.locator('.design-card > a').first();
    await firstCard.focus();
    const focusOutline = await firstCard.evaluate((element) => getComputedStyle(element).outlineStyle);
    if (focusOutline === 'none') failures.push(`gallery ${viewport.name} design cards lack visible keyboard focus`);

    await runAxe(page, `gallery ${viewport.name}`);
    const galleryShot = join(artifactRoot, `gallery-${viewport.name}.png`);
    await page.screenshot({ path: galleryShot, fullPage: true, animations: 'disabled' });
    report.screenshots.push(galleryShot);

    for (const design of designs) {
      consoleErrors.length = 0;
      pageErrors.length = 0;
      localResponseErrors.length = 0;

      const response = await page.goto(`${baseUrl}${design.route}`, { waitUntil: 'domcontentloaded' });
      const iframeHandle = await page.locator('iframe').elementHandle();
      const frame = await iframeHandle?.contentFrame();
      if (!frame) {
        failures.push(`${design.name} ${viewport.name} did not expose a content frame`);
        continue;
      }
      await frame.waitForLoadState('domcontentloaded');
      await frame.evaluate(async () => {
        await Promise.race([document.fonts.ready, new Promise((resolveWait) => setTimeout(resolveWait, 4000))]);
      });

      const shell = await page.evaluate(() => {
        const back = document.querySelector('.all-designs');
        const frameElement = document.querySelector('iframe');
        const bounds = back?.getBoundingClientRect();
        return {
          backText: back?.textContent?.trim() || '',
          backHref: back?.getAttribute('href'),
          backBounds: bounds ? { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height } : null,
          frameTitle: frameElement?.getAttribute('title'),
          robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        };
      });
      const content = await frame.evaluate(() => ({
        h1Count: document.querySelectorAll('h1').length,
        h1: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim() || '',
        body: document.body.innerText.replace(/\s+/g, ' '),
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      }));

      report.previews.push({ design: design.name, viewport: viewport.name, status: response?.status() || 0, shell, content });
      if (response?.status() !== 200) failures.push(`${design.name} ${viewport.name} returned ${response?.status()}`);
      if (shell.backText !== 'All designs' || shell.backHref !== '/') failures.push(`${design.name} ${viewport.name} has an invalid return control`);
      if (
        !shell.backBounds
        || shell.backBounds.width > 96
        || shell.backBounds.height > 34
        || shell.backBounds.x > 10
        || shell.backBounds.y < 35.5
        || shell.backBounds.y > 36.5
      ) {
        failures.push(`${design.name} ${viewport.name} return control is not compact, left-aligned, and 36px from the top`);
      }
      if (shell.frameTitle !== `${design.name} homepage preview`) failures.push(`${design.name} ${viewport.name} iframe title is incorrect`);
      if (shell.robots !== 'noindex, nofollow') failures.push(`${design.name} ${viewport.name} shell is missing noindex`);
      if (shell.overflow || content.overflow) failures.push(`${design.name} overflows horizontally at ${viewport.name}`);
      if (content.h1Count !== 1) failures.push(`${design.name} ${viewport.name} has ${content.h1Count} H1 elements`);
      if (!/Hyperboards|business|buyer/i.test(content.body)) failures.push(`${design.name} ${viewport.name} preview content did not load`);

      await page.locator('.all-designs').focus();
      const backOutline = await page.locator('.all-designs').evaluate((element) => getComputedStyle(element).outlineStyle);
      if (backOutline === 'none') failures.push(`${design.name} ${viewport.name} return control lacks visible focus`);

      await runAxe(frame, `${design.name} ${viewport.name}`);
      if (consoleErrors.length) failures.push(`${design.name} ${viewport.name} console errors: ${consoleErrors.join(' | ')}`);
      if (pageErrors.length) failures.push(`${design.name} ${viewport.name} page errors: ${pageErrors.join(' | ')}`);
      if (localResponseErrors.length) failures.push(`${design.name} ${viewport.name} local response errors: ${localResponseErrors.join(' | ')}`);

      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      });
      const previewShot = join(artifactRoot, `${design.slug}-${viewport.name}.png`);
      await page.screenshot({ path: previewShot, animations: 'disabled' });
      report.screenshots.push(previewShot);
    }

    await context.close();
  }
} catch (error) {
  failures.push(`Design gallery QA crashed: ${error instanceof Error ? error.stack || error.message : String(error)}`);
} finally {
  await browser?.close();
}

function assertOrder(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push(`${label} is ${actual.join(' | ')}; expected ${expected.join(' | ')}`);
  }
}

await writeFile(resolve('artifacts', 'design-gallery-qa.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (failures.length) {
  process.stderr.write(`Design gallery QA failed with ${failures.length} issue(s):\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Design gallery QA passed: ${designs.length} previews × ${viewports.length} viewports.\n`);
}
