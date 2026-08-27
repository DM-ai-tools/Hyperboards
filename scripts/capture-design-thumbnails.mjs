import { mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { designs } from '../src/data/designs.ts';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = join(projectRoot, 'public', 'design-thumbnails');
const baseUrl = (process.env.QA_BASE_URL || 'http://127.0.0.1:4321').replace(/\/$/, '');

await mkdir(outputRoot, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
});

try {
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);

  for (const design of designs) {
    const response = await page.goto(`${baseUrl}${design.contentUrl}`, { waitUntil: 'networkidle' });
    if (!response?.ok()) {
      throw new Error(`${design.name} returned ${response?.status() ?? 'no response'}`);
    }

    const screenshot = await page.screenshot({ type: 'png', animations: 'disabled' });
    await sharp(screenshot)
      .resize(960, 600, { fit: 'cover', position: 'top' })
      .webp({ quality: 78, effort: 5 })
      .toFile(join(outputRoot, `${design.slug}.webp`));

    process.stdout.write(`Captured ${design.name}.\n`);
  }
} finally {
  await context.close();
  await browser.close();
}
