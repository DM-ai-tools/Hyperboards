import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import axeCore from 'axe-core';
import { chromium } from 'playwright-core';

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const artifactDir = resolve('artifacts', 'screenshots');
await mkdir(artifactDir, { recursive: true });

const routes = [
  '/',
  '/what-we-acquire',
  '/business-owners',
  '/our-approach',
  '/about',
  '/contact',
  '/investor-relationships',
  '/privacy',
  '/terms',
  '/thank-you',
];

const failures = [];
const report = { routes: [], responsive: [], accessibility: [], consoleErrors: [], expectedConsoleErrors: [], pageErrors: [], requestFailures: [], checks: [] };
let browser;
let testingExpected404 = false;

async function revealForScreenshot(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'));
  });
}

async function expectSelectedPanel(page, root, value) {
  const option = page.locator(`${root} [data-folio-option][data-value="${value}"]`);
  const panel = page.locator(`${root} [data-folio-panel][data-value="${value}"]`);
  if ((await option.getAttribute('aria-selected')) !== 'true') {
    failures.push(`${root} did not select ${value}`);
  }
  if (!(await panel.isVisible())) failures.push(`${root} did not reveal the ${value} panel`);
}

try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await desktop.newPage();

  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    if (testingExpected404 && message.text().includes('404')) report.expectedConsoleErrors.push(message.text());
    else report.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => report.pageErrors.push(String(error)));
  page.on('requestfailed', (request) => report.requestFailures.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText}`));

  for (const route of routes) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    const h1Count = await page.locator('h1').count();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    const title = await page.title();
    const status = response?.status() || 0;
    report.routes.push({ route, status, h1Count, overflow, title });
    if (status !== 200) failures.push(`${route} returned ${status}`);
    if (h1Count !== 1) failures.push(`${route} has ${h1Count} H1 elements`);
    if (overflow) failures.push(`${route} overflows horizontally at 1440px`);

    await page.addScriptTag({ content: axeCore.source });
    const axeResult = await page.evaluate(async () => {
      const result = await window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        },
      });
      return result.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        nodes: violation.nodes.map((node) => node.target.join(' ')),
      }));
    });
    report.accessibility.push({ route, violations: axeResult });
    const seriousViolations = axeResult.filter((item) => item.impact === 'serious' || item.impact === 'critical');
    if (seriousViolations.length) {
      failures.push(`${route} has ${seriousViolations.length} serious automated WCAG violation(s): ${seriousViolations.map((item) => item.id).join(', ')}`);
    }
  }

  await page.goto(`${baseUrl}/what-we-acquire`, { waitUntil: 'networkidle' });
  await page.locator('[data-mandate-explorer] [data-folio-option][data-value="deal-value"]').click();
  await expectSelectedPanel(page, '[data-mandate-explorer]', 'deal-value');

  await page.goto(`${baseUrl}/business-owners`, { waitUntil: 'networkidle' });
  await page.locator('[data-owner-path] [data-folio-option][data-value="exploring"]').focus();
  await page.keyboard.press('ArrowRight');
  await expectSelectedPanel(page, '[data-owner-path]', 'preparing');

  await page.goto(`${baseUrl}/our-approach`, { waitUntil: 'networkidle' });
  await page.locator('[data-underwriting-lens] [data-folio-option]').nth(2).click();
  const selectedLensValue = await page.locator('[data-underwriting-lens] [data-folio-option]').nth(2).getAttribute('data-value');
  await expectSelectedPanel(page, '[data-underwriting-lens]', selectedLensValue);

  await page.goto(`${baseUrl}/about`, { waitUntil: 'networkidle' });
  await page.locator('[data-role-comparator] [data-folio-option][data-value="broker"]').click();
  await expectSelectedPanel(page, '[data-role-comparator]', 'broker');

  await page.goto(`${baseUrl}/contact`, { waitUntil: 'networkidle' });
  await page.locator('[name="company"]').focus();
  if ((await page.locator('[data-intake-guidance]').getAttribute('data-active')) !== 'profile') {
    failures.push('Contact guidance did not advance to the business profile chapter');
  }

  await page.goto(`${baseUrl}/investor-relationships`, { waitUntil: 'networkidle' });
  await page.locator('[data-alignment-ledger] [data-folio-option][data-value="transaction"]').click();
  await expectSelectedPanel(page, '[data-alignment-ledger]', 'transaction');
  report.checks.push({ name: 'folio-interactions', passed: true });

  for (const width of [320, 390, 768, 1024, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      report.responsive.push({ route, width, overflow });
      if (overflow) failures.push(`${route} overflows horizontally at ${width}px`);
    }
  }

  testingExpected404 = true;
  const missingPage = await page.goto(`${baseUrl}/this-page-does-not-exist`, { waitUntil: 'networkidle' });
  testingExpected404 = false;
  if (missingPage?.status() !== 404) failures.push(`Missing route returned ${missingPage?.status()} instead of 404`);
  await page.screenshot({ path: resolve(artifactDir, '404-desktop.png'), fullPage: true });

  for (const assetRoute of ['/robots.txt', '/sitemap.xml', '/favicon.svg']) {
    const assetResponse = await page.request.get(`${baseUrl}${assetRoute}`);
    if (assetResponse.status() !== 200) failures.push(`${assetRoute} returned ${assetResponse.status()}`);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.screenshot({ path: resolve(artifactDir, 'home-hero-desktop.png') });
  await revealForScreenshot(page);
  await page.screenshot({ path: resolve(artifactDir, 'home-desktop.png'), fullPage: true });
  await page.locator('.criteria-band').scrollIntoViewIfNeeded();
  await page.screenshot({ path: resolve(artifactDir, 'home-criteria-desktop.png') });
  await page.locator('.owner-context__aside').scrollIntoViewIfNeeded();
  await page.screenshot({ path: resolve(artifactDir, 'home-buyer-plaque-desktop.png') });
  await page.locator('.sectors-section').scrollIntoViewIfNeeded();
  await page.screenshot({ path: resolve(artifactDir, 'home-sectors-desktop.png') });
  await page.locator('.process-section').scrollIntoViewIfNeeded();
  await page.screenshot({ path: resolve(artifactDir, 'home-process-desktop.png') });
  await page.locator('.cta-band').scrollIntoViewIfNeeded();
  await page.screenshot({ path: resolve(artifactDir, 'home-cta-desktop.png') });
  report.checks.push({ name: 'desktop-home-screenshot', passed: true });

  for (const [route, filename] of [
    ['/what-we-acquire', 'what-we-acquire-desktop.png'],
    ['/business-owners', 'business-owners-desktop.png'],
    ['/our-approach', 'our-approach-desktop.png'],
    ['/about', 'about-desktop.png'],
    ['/contact', 'contact-desktop.png'],
    ['/investor-relationships', 'investor-relationships-desktop.png'],
    ['/privacy', 'privacy-desktop.png'],
    ['/terms', 'terms-desktop.png'],
    ['/thank-you', 'thank-you-desktop.png'],
  ]) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'load' });
    await revealForScreenshot(page);
    await page.screenshot({ path: resolve(artifactDir, filename), fullPage: true });
  }
  report.checks.push({ name: 'internal-route-screenshots', passed: true });

  const invalidResponse = await page.request.post(`${baseUrl}/api/inquiries`, {
    headers: { Accept: 'application/json' },
    data: { fullName: 'A' },
  });
  if (invalidResponse.status() !== 400) failures.push(`Invalid inquiry returned ${invalidResponse.status()} instead of 400`);

  const validButUnconfiguredResponse = await page.request.post(`${baseUrl}/api/inquiries`, {
    headers: { Accept: 'application/json' },
    data: {
      fullName: 'Quality Test',
      email: 'qa@example.com',
      company: 'Example Company',
      companyWebsite: 'https://example.com',
      location: 'Test City',
      industry: 'manufacturing',
      ebitda: '1m-2m',
      role: 'owner',
      message: 'This is a browser QA request and must not be treated as a real inquiry.',
      acknowledgement: true,
    },
  });
  if (validButUnconfiguredResponse.status() !== 503) {
    failures.push(`Unconfigured inquiry returned ${validButUnconfiguredResponse.status()} instead of 503`);
  }
  const crossOriginResponse = await page.request.post(`${baseUrl}/api/inquiries`, {
    headers: { Accept: 'application/json', Origin: 'https://invalid.example' },
    data: { fullName: 'Cross Origin Test' },
  });
  if (crossOriginResponse.status() !== 403) failures.push(`Cross-origin inquiry returned ${crossOriginResponse.status()} instead of 403`);

  const oversizedResponse = await page.request.post(`${baseUrl}/api/inquiries`, {
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    data: JSON.stringify({ message: 'x'.repeat(33_000) }),
  });
  if (oversizedResponse.status() !== 413) failures.push(`Oversized inquiry returned ${oversizedResponse.status()} instead of 413`);

  if (report.consoleErrors.length) failures.push(`Console errors: ${report.consoleErrors.join(' | ')}`);
  if (report.pageErrors.length) failures.push(`Page errors: ${report.pageErrors.join(' | ')}`);
  if (report.requestFailures.length) failures.push(`Request failures: ${report.requestFailures.join(' | ')}`);

  report.checks.push({ name: 'api-validation-contract', passed: invalidResponse.status() === 400 });
  report.checks.push({ name: 'api-configuration-contract', passed: validButUnconfiguredResponse.status() === 503 });
  report.checks.push({ name: 'api-origin-contract', passed: crossOriginResponse.status() === 403 });
  report.checks.push({ name: 'api-size-contract', passed: oversizedResponse.status() === 413 });

  await desktop.close();

  const noScript = await browser.newContext({ viewport: { width: 1024, height: 800 }, javaScriptEnabled: false });
  const noScriptPage = await noScript.newPage();
  await noScriptPage.goto(baseUrl, { waitUntil: 'load' });
  if ((await noScriptPage.locator('h1').count()) !== 1) failures.push('Homepage content is not available without JavaScript');
  await noScriptPage.goto(`${baseUrl}/contact`, { waitUntil: 'load' });
  if ((await noScriptPage.locator('form[action="/api/inquiries"]').count()) !== 1) failures.push('Contact form is not available without JavaScript');
  report.checks.push({ name: 'progressive-enhancement', passed: true });
  await noScript.close();

  const reducedMotion = await browser.newContext({ viewport: { width: 1024, height: 800 }, reducedMotion: 'reduce' });
  const reducedMotionPage = await reducedMotion.newPage();
  await reducedMotionPage.goto(baseUrl, { waitUntil: 'networkidle' });
  const reducedMotionContract = await reducedMotionPage.evaluate(() => ({
    hiddenRevealCount: [...document.querySelectorAll('[data-reveal]')].filter((element) => getComputedStyle(element).opacity === '0').length,
    longAnimations: document.getAnimations().filter((animation) => {
      const duration = Number(animation.effect?.getComputedTiming().duration || 0);
      return animation.playState === 'running' && duration > 50;
    }).length,
  }));
  if (reducedMotionContract.hiddenRevealCount !== 0) failures.push('Reduced-motion mode hides reveal content');
  if (reducedMotionContract.longAnimations !== 0) failures.push('Reduced-motion mode leaves long-running animations active');
  report.checks.push({
    name: 'reduced-motion',
    passed: reducedMotionContract.hiddenRevealCount === 0 && reducedMotionContract.longAnimations === 0,
  });
  await reducedMotion.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(baseUrl, { waitUntil: 'networkidle' });
  const mobileOverflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (mobileOverflow) failures.push('Homepage overflows horizontally at 390px');

  const toggle = mobilePage.locator('[data-menu-toggle]');
  await toggle.click();
  const expanded = await toggle.getAttribute('aria-expanded');
  const menuVisible = await mobilePage.locator('[data-mobile-menu]').isVisible();
  if (expanded !== 'true' || !menuVisible) failures.push('Mobile navigation did not open accessibly');
  await mobilePage.keyboard.press('Escape');
  if ((await toggle.getAttribute('aria-expanded')) !== 'false') failures.push('Mobile navigation did not close on Escape');

  await mobilePage.screenshot({ path: resolve(artifactDir, 'home-hero-mobile.png') });
  await revealForScreenshot(mobilePage);
  await mobilePage.screenshot({ path: resolve(artifactDir, 'home-mobile.png'), fullPage: true });
  await mobilePage.goto(`${baseUrl}/what-we-acquire`, { waitUntil: 'networkidle' });
  await revealForScreenshot(mobilePage);
  await mobilePage.screenshot({ path: resolve(artifactDir, 'what-we-acquire-hero-mobile.png') });
  await mobilePage.screenshot({ path: resolve(artifactDir, 'what-we-acquire-mobile.png'), fullPage: true });
  for (const [route, filename] of [
    ['/business-owners', 'business-owners-mobile.png'],
    ['/our-approach', 'our-approach-mobile.png'],
    ['/about', 'about-mobile.png'],
    ['/contact', 'contact-mobile.png'],
    ['/investor-relationships', 'investor-relationships-mobile.png'],
  ]) {
    await mobilePage.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    await revealForScreenshot(mobilePage);
    await mobilePage.screenshot({ path: resolve(artifactDir, filename), fullPage: true });
  }
  report.checks.push({ name: 'mobile-menu-keyboard', passed: expanded === 'true' && menuVisible });
  report.checks.push({ name: 'mobile-horizontal-overflow', passed: !mobileOverflow });
  await mobile.close();
} catch (error) {
  failures.push(`Browser QA crashed: ${error instanceof Error ? error.stack || error.message : String(error)}`);
} finally {
  await browser?.close();
}

report.failures = failures;
await writeFile(resolve('artifacts', 'browser-qa.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (failures.length) {
  console.error(`Browser QA failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Browser QA passed: ${routes.length} routes, desktop/mobile screenshots, navigation and API contracts.`);
}
