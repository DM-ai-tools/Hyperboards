import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import axeCore from 'axe-core';
import { chromium } from 'playwright-core';

const projectRoot = resolve('.');
const artifactRoot = resolve('artifacts', 'frontpage-concepts');
const port = Number(process.env.CONCEPT_QA_PORT || 4411);
const baseUrl = `http://127.0.0.1:${port}`;

const concepts = [
  { route: '01-monumental-ledger', name: 'monumental-ledger', h1: 'Your company deserves a buyer' },
  { route: '02-operators-atlas', name: 'operators-atlas', h1: 'Built to acquire' },
  { route: '03-quiet-cinema', name: 'quiet-cinema', h1: 'What you built' },
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
const report = { concepts: [], interactions: [], accessibility: [], screenshots: [], failures };

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
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: 'dark' });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(String(error)));

    for (const concept of concepts) {
      const url = `${baseUrl}/prototypes/frontpage-concepts/${concept.route}/`;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.evaluate(async () => {
        await Promise.race([document.fonts.ready, new Promise((resolveWait) => setTimeout(resolveWait, 4000))]);
      });
      await page.waitForTimeout(1800);

      const structural = await page.evaluate(() => ({
        title: document.title,
        h1Count: document.querySelectorAll('h1').length,
        h1Text: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim() || '',
        bodyText: document.body.innerText.replace(/\s+/g, ' '),
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        skipLink: Boolean(document.querySelector('a[href^="#"]')),
      }));

      const result = {
        concept: concept.name,
        viewport: viewportName,
        status: response?.status() || 0,
        ...structural,
      };
      report.concepts.push(result);
      if (result.status !== 200) failures.push(`${concept.name} ${viewportName} returned ${result.status}`);
      if (result.h1Count !== 1) failures.push(`${concept.name} ${viewportName} has ${result.h1Count} H1 elements`);
      if (!result.h1Text.includes(concept.h1)) failures.push(`${concept.name} ${viewportName} has unexpected H1: ${result.h1Text}`);
      if (!/not (?:an? )?(?:investment bank|broker)/i.test(result.bodyText)) failures.push(`${concept.name} ${viewportName} lacks explicit intermediary distinction`);
      if (result.scrollWidth > result.clientWidth + 1) failures.push(`${concept.name} overflows ${viewportName}: ${result.scrollWidth}px > ${result.clientWidth}px`);

      await page.keyboard.press('Home');
      await page.keyboard.press('Tab');
      const keyboardTarget = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim() }));
      if (keyboardTarget.tag !== 'A') failures.push(`${concept.name} ${viewportName} keyboard did not reach the skip link first`);

      await page.addScriptTag({ content: axeCore.source });
      const violations = await page.evaluate(async () => {
        const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } });
        return result.violations.map(({ id, impact, help, nodes }) => ({ id, impact, help, nodes: nodes.map((node) => node.target.join(' ')) }));
      });
      const serious = violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
      report.accessibility.push({ concept: concept.name, viewport: viewportName, violations });
      if (serious.length) failures.push(`${concept.name} ${viewportName} has serious axe violations: ${serious.map(({ id }) => id).join(', ')}`);

      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        document.querySelectorAll('.ledger-reveal, .atlas-reveal, .cinema-reveal').forEach((element) => element.classList.add('is-visible'));
        document.querySelector('[data-route-path]')?.classList.add('is-plotted');
      });
      const screenshotPath = join(artifactRoot, `${concept.name}-${viewportName}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      report.screenshots.push(screenshotPath);
    }

    if (consoleErrors.length) failures.push(`${viewportName} console errors: ${consoleErrors.join(' | ')}`);
    if (pageErrors.length) failures.push(`${viewportName} page errors: ${pageErrors.join(' | ')}`);
    await context.close();
  }

  const interactionContext = await browser.newContext({ viewport: viewports.desktop });
  const interactionPage = await interactionContext.newPage();

  await interactionPage.goto(`${baseUrl}/prototypes/frontpage-concepts/01-monumental-ledger/`, { waitUntil: 'domcontentloaded' });
  await interactionPage.evaluate(() => window.scrollTo(0, 160));
  await interactionPage.waitForTimeout(300);
  const ledgerCompact = await interactionPage.locator('[data-header]').evaluate((element) => element.classList.contains('is-compact'));
  report.interactions.push({ concept: 'monumental-ledger', name: 'compact header', passed: ledgerCompact });
  if (!ledgerCompact) failures.push('monumental-ledger did not compact its header after scroll');

  await interactionPage.goto(`${baseUrl}/prototypes/frontpage-concepts/02-operators-atlas/`, { waitUntil: 'domcontentloaded' });
  await interactionPage.locator('[data-bearing="40"]').focus();
  await interactionPage.keyboard.press('Enter');
  const atlasSelection = await interactionPage.locator('[data-sector-name]').textContent();
  const atlasPressed = await interactionPage.locator('[data-bearing="40"]').getAttribute('aria-pressed');
  const atlasInteraction = atlasSelection?.includes('Communication & Media') && atlasPressed === 'true';
  report.interactions.push({ concept: 'operators-atlas', name: 'keyboard sector compass', passed: atlasInteraction });
  if (!atlasInteraction) failures.push('operators-atlas sector compass did not respond to keyboard activation');

  await interactionPage.goto(`${baseUrl}/prototypes/frontpage-concepts/03-quiet-cinema/`, { waitUntil: 'domcontentloaded' });
  await interactionPage.locator('[data-scene-target="customers"]').focus();
  await interactionPage.keyboard.press('Enter');
  const cinemaPressed = await interactionPage.locator('[data-scene-target="customers"]').getAttribute('aria-pressed');
  const cinemaVisible = await interactionPage.locator('[data-scene="customers"]').isVisible();
  const cinemaInteraction = cinemaPressed === 'true' && cinemaVisible;
  report.interactions.push({ concept: 'quiet-cinema', name: 'keyboard scene selector', passed: cinemaInteraction });
  if (!cinemaInteraction) failures.push('quiet-cinema scene selector did not respond to keyboard activation');
  await interactionContext.close();

  const reducedContext = await browser.newContext({ viewport: viewports.desktop, reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  for (const concept of concepts) {
    await reducedPage.goto(`${baseUrl}/prototypes/frontpage-concepts/${concept.route}/`, { waitUntil: 'domcontentloaded' });
    const reducedContract = await reducedPage.evaluate(() => ({
      hiddenRevealCount: [...document.querySelectorAll('.ledger-reveal, .atlas-reveal, .cinema-reveal')].filter((element) => Number.parseFloat(getComputedStyle(element).opacity) < 0.9).length,
      longRunningAnimations: document.getAnimations().filter((animation) => Number(animation.effect?.getComputedTiming().duration || 0) > 50 && animation.playState === 'running').length,
    }));
    if (reducedContract.hiddenRevealCount) failures.push(`${concept.name} hides ${reducedContract.hiddenRevealCount} elements with reduced motion`);
    if (reducedContract.longRunningAnimations) failures.push(`${concept.name} leaves ${reducedContract.longRunningAnimations} long animations under reduced motion`);
  }
  await reducedContext.close();
} catch (error) {
  failures.push(`Concept browser QA crashed: ${error instanceof Error ? error.stack || error.message : String(error)}`);
} finally {
  await browser?.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}

await writeFile(join(artifactRoot, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (failures.length) {
  console.error(`Concept browser QA failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Concept browser QA passed: ${concepts.length} concepts, ${Object.keys(viewports).length} viewports, ${report.screenshots.length} full-page screenshots.`);
}
