import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import axeCore from 'axe-core';
import { chromium } from 'playwright-core';

const projectRoot = resolve('.');
const artifactRoot = resolve('artifacts', 'frontpage-concepts-v2');
const port = Number(process.env.CONCEPT_V2_QA_PORT || 4412);
const baseUrl = `http://127.0.0.1:${port}`;

const concepts = [
  {
    route: '01-evergreen-partner',
    name: 'evergreen-partner',
    h1: 'A direct buyer for the business you built',
    menu: '[data-evergreen-menu]',
    nav: '[data-evergreen-nav]',
    reveal: '.evergreen-reveal',
    criteria: '.evergreen-profile',
  },
  {
    route: '02-cobalt-standard',
    name: 'cobalt-standard',
    h1: 'We buy established businesses. Directly',
    menu: '[data-cobalt-menu]',
    nav: '[data-cobalt-nav]',
    reveal: '.cobalt-rise',
    criteria: '.cobalt-criteria-rail',
  },
];

const viewports = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 },
};

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

const failures = [];
const report = { pages: [], interactions: [], accessibility: [], progressiveEnhancement: [], screenshots: [], failures };

const server = createServer(async (request, response) => {
  try {
    const requestPath = decodeURIComponent(new URL(request.url || '/', baseUrl).pathname);
    const normalizedPath = normalize(requestPath).replace(/^[/\\]+/, '');
    let filePath = resolve(projectRoot, normalizedPath);
    if (!filePath.startsWith(`${projectRoot}${sep}`) && filePath !== projectRoot) throw new Error('Path rejected');
    const fileStats = await stat(filePath).catch(() => null);
    if (fileStats?.isDirectory()) filePath = join(filePath, 'index.html');
    const file = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': contentTypes.get(extname(filePath)) || 'application/octet-stream' });
    response.end(file);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

await mkdir(artifactRoot, { recursive: true });
await new Promise((resolveListen, rejectListen) => {
  server.once('error', rejectListen);
  server.listen(port, '127.0.0.1', resolveListen);
});

let browser;
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });

  for (const [viewportName, viewport] of Object.entries(viewports)) {
    for (const concept of concepts) {
      const context = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: 'light' });
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      const badResponses = [];
      page.on('console', (message) => {
        if (message.type() !== 'error') return;
        const location = message.location();
        consoleErrors.push(`${message.text()}${location.url ? ` @ ${location.url}` : ''}`);
      });
      page.on('pageerror', (error) => pageErrors.push(String(error)));
      page.on('response', (networkResponse) => {
        if (networkResponse.status() >= 400) badResponses.push(`${networkResponse.status()} ${networkResponse.url()}`);
      });

      const url = `${baseUrl}/prototypes/frontpage-concepts-v2/${concept.route}/`;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.evaluate(async () => {
        await Promise.race([document.fonts.ready, new Promise((resolveWait) => setTimeout(resolveWait, 4000))]);
      });
      await page.waitForTimeout(700);

      const structural = await page.evaluate(({ criteriaSelector }) => {
        const criteria = document.querySelector(criteriaSelector);
        const h1 = document.querySelector('h1');
        return {
          title: document.title,
          h1Count: document.querySelectorAll('h1').length,
          h1Text: h1?.textContent?.replace(/\s+/g, ' ').trim() || '',
          bodyText: document.body.innerText.replace(/\s+/g, ' '),
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          skipLinkText: document.querySelector('body > a[href^="#"]')?.textContent?.trim() || '',
          h1Top: h1?.getBoundingClientRect().top ?? Infinity,
          criteriaTop: criteria?.getBoundingClientRect().top ?? Infinity,
          viewportHeight: window.innerHeight,
        };
      }, { criteriaSelector: concept.criteria });

      const result = { concept: concept.name, viewport: viewportName, status: response?.status() || 0, ...structural };
      report.pages.push(result);
      if (result.status !== 200) failures.push(`${concept.name} ${viewportName} returned ${result.status}`);
      if (result.h1Count !== 1) failures.push(`${concept.name} ${viewportName} has ${result.h1Count} H1 elements`);
      if (!result.h1Text.includes(concept.h1)) failures.push(`${concept.name} ${viewportName} has unexpected H1: ${result.h1Text}`);
      if (!/Hyperboards (?:is|remains) the buyer|we are the buyer/i.test(result.bodyText)) failures.push(`${concept.name} ${viewportName} lacks the explicit buyer role`);
      if (!/not (?:an? )?(?:investment bank|broker)/i.test(result.bodyText)) failures.push(`${concept.name} ${viewportName} lacks intermediary distinction`);
      if (result.scrollWidth > result.clientWidth + 1) failures.push(`${concept.name} overflows ${viewportName}: ${result.scrollWidth}px > ${result.clientWidth}px`);
      if (!/skip to content/i.test(result.skipLinkText)) failures.push(`${concept.name} ${viewportName} is missing the first-child skip link`);
      if (viewportName === 'desktop' && (result.h1Top >= result.viewportHeight || result.criteriaTop >= result.viewportHeight)) failures.push(`${concept.name} does not show its proposition and criteria in the desktop first viewport`);

      await page.keyboard.press('Home');
      await page.keyboard.press('Tab');
      const firstFocus = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim() }));
      if (firstFocus.tag !== 'A' || !/skip to content/i.test(firstFocus.text || '')) failures.push(`${concept.name} ${viewportName} does not focus the skip link first`);

      if (viewportName === 'mobile') {
        const menu = page.locator(concept.menu);
        await menu.focus();
        await page.keyboard.press('Enter');
        const expanded = await menu.getAttribute('aria-expanded');
        const navVisible = await page.locator(concept.nav).isVisible();
        report.interactions.push({ concept: concept.name, name: 'mobile menu keyboard toggle', passed: expanded === 'true' && navVisible });
        if (expanded !== 'true' || !navVisible) failures.push(`${concept.name} mobile menu did not open from the keyboard`);
      }

      const firstSummary = page.locator('details summary').first();
      await firstSummary.focus();
      await page.keyboard.press('Enter');
      const disclosureOpen = await firstSummary.evaluate((summary) => summary.parentElement?.hasAttribute('open'));
      report.interactions.push({ concept: concept.name, viewport: viewportName, name: 'FAQ keyboard disclosure', passed: disclosureOpen });
      if (!disclosureOpen) failures.push(`${concept.name} ${viewportName} FAQ did not open from the keyboard`);

      await page.addScriptTag({ content: axeCore.source });
      const violations = await page.evaluate(async () => {
        const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } });
        return result.violations.map(({ id, impact, help, nodes }) => ({ id, impact, help, nodes: nodes.map((node) => node.target.join(' ')) }));
      });
      const serious = violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
      report.accessibility.push({ concept: concept.name, viewport: viewportName, violations });
      if (serious.length) failures.push(`${concept.name} ${viewportName} has serious axe violations: ${serious.map(({ id }) => id).join(', ')}`);
      if (consoleErrors.length) failures.push(`${concept.name} ${viewportName} console errors: ${consoleErrors.join(' | ')}${badResponses.length ? ` [${badResponses.join(' | ')}]` : ''}`);
      if (pageErrors.length) failures.push(`${concept.name} ${viewportName} page errors: ${pageErrors.join(' | ')}`);

      await page.evaluate((selector) => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        document.querySelectorAll(selector).forEach((element) => element.classList.add('is-visible', 'is-ready'));
        const stickyHeader = document.querySelector('header');
        const skipLink = document.querySelector('body > a[href^="#"]');
        stickyHeader?.style.setProperty('position', 'relative', 'important');
        skipLink?.style.setProperty('display', 'none', 'important');
        window.scrollTo(0, 0);
      }, concept.reveal);
      await page.waitForTimeout(100);
      const screenshotPath = join(artifactRoot, `${concept.name}-${viewportName}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      report.screenshots.push(screenshotPath);
      await context.close();
    }
  }

  for (const concept of concepts) {
    const noJsContext = await browser.newContext({ viewport: viewports.mobile, javaScriptEnabled: false });
    const noJsPage = await noJsContext.newPage();
    await noJsPage.goto(`${baseUrl}/prototypes/frontpage-concepts-v2/${concept.route}/`, { waitUntil: 'domcontentloaded' });
    const contract = await noJsPage.evaluate(() => ({
      h1Visible: Boolean(document.querySelector('h1')?.getClientRects().length),
      ctaVisible: [...document.querySelectorAll('a')].some((link) => /discuss selling your business/i.test(link.textContent || '') && link.getClientRects().length),
      navVisible: Boolean(document.querySelector('nav')?.getClientRects().length),
    }));
    report.progressiveEnhancement.push({ concept: concept.name, ...contract });
    if (!contract.h1Visible || !contract.ctaVisible || !contract.navVisible) failures.push(`${concept.name} hides core content or navigation without JavaScript`);
    await noJsContext.close();
  }

  const reducedContext = await browser.newContext({ viewport: viewports.desktop, reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  for (const concept of concepts) {
    await reducedPage.goto(`${baseUrl}/prototypes/frontpage-concepts-v2/${concept.route}/`, { waitUntil: 'domcontentloaded' });
    const reducedContract = await reducedPage.evaluate((selector) => ({
      hiddenRevealCount: [...document.querySelectorAll(selector)].filter((element) => Number.parseFloat(getComputedStyle(element).opacity) < 0.9).length,
      longRunningAnimations: document.getAnimations().filter((animation) => Number(animation.effect?.getComputedTiming().duration || 0) > 50 && animation.playState === 'running').length,
    }), concept.reveal);
    if (reducedContract.hiddenRevealCount) failures.push(`${concept.name} hides ${reducedContract.hiddenRevealCount} elements with reduced motion`);
    if (reducedContract.longRunningAnimations) failures.push(`${concept.name} leaves ${reducedContract.longRunningAnimations} long animations under reduced motion`);
  }
  await reducedContext.close();
} catch (error) {
  failures.push(`Concept v2 browser QA crashed: ${error instanceof Error ? error.stack || error.message : String(error)}`);
} finally {
  await browser?.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}

await writeFile(join(artifactRoot, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (failures.length) {
  console.error(`Concept v2 browser QA failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Concept v2 browser QA passed: ${concepts.length} concepts, ${Object.keys(viewports).length} viewports, ${report.screenshots.length} full-page screenshots.`);
}
