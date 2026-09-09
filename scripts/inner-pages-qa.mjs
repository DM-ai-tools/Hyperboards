import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import axeCore from 'axe-core';
import { chromium } from 'playwright-core';

const baseUrl = (process.env.QA_BASE_URL || 'http://127.0.0.1:4321').replace(/\/$/, '');
const previewRoot = '/design-previews/evergreen-partner-refined';
const routes = [
  { slug: 'sell-your-business', title: 'Discuss Selling Your Business | Hyperboards' },
  { slug: 'what-we-acquire', title: 'What We Acquire | Hyperboards' },
];
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];
const output = resolve('artifacts', 'inner-pages');
const failures = [];
const report = [];
await mkdir(output, { recursive: true });

let browser;
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const route of routes) {
      const url = `${baseUrl}${previewRoot}/${route.slug}.html`;
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      await page.addScriptTag({ content: axeCore.source });
      const result = await page.evaluate(async () => {
        const axe = await window.axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
        });
        return {
          h1Count: document.querySelectorAll('h1').length,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          serious: axe.violations
            .filter(({ impact }) => impact === 'serious' || impact === 'critical')
            .map(({ id, nodes }) => ({ id, nodes: nodes.map((node) => node.target.join(' ')) })),
        };
      });
      const title = await page.title();
      report.push({ route: route.slug, viewport: viewport.name, status: response?.status(), title, ...result });
      if (response?.status() !== 200) failures.push(`${route.slug} ${viewport.name} returned ${response?.status()}`);
      if (title !== route.title) failures.push(`${route.slug} ${viewport.name} has an unexpected title`);
      if (result.h1Count !== 1) failures.push(`${route.slug} ${viewport.name} has ${result.h1Count} H1 elements`);
      if (result.overflow) failures.push(`${route.slug} overflows at ${viewport.name}`);
      if (result.serious.length) failures.push(`${route.slug} ${viewport.name} has serious axe violations: ${result.serious.map(({ id, nodes }) => `${id} (${nodes.join(', ')})`).join('; ')}`);
      await page.screenshot({ path: resolve(output, `${route.slug}-${viewport.name}.png`), fullPage: true, animations: 'disabled' });
    }
    await context.close();
  }
} catch (error) {
  failures.push(error instanceof Error ? error.stack || error.message : String(error));
} finally {
  await browser?.close();
}

await writeFile(resolve(output, 'report.json'), `${JSON.stringify({ report, failures }, null, 2)}\n`, 'utf8');
if (failures.length) {
  process.stderr.write(`Inner-page QA failed:\n${failures.map((item) => `- ${item}`).join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Inner-page QA passed: ${routes.length} pages × ${viewports.length} viewports.\n`);
}
