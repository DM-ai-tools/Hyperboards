import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { designs } from './sync-premium-showcase.mjs';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const destination = resolve('Hyper boards DEMO/showcase-assets');
await mkdir(destination, {recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
try {
  const page = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  for (const [index, slug] of designs.entries()) {
    await page.goto(`${base}/showcase/${slug}/index.html`, {waitUntil:'networkidle'});
    await page.evaluate(() => document.fonts.ready);
    await sharp(await page.screenshot({type:'png'})).webp({quality:86,effort:5}).toFile(join(destination,`design-${index+1}.webp`));
  }
} finally { await browser.close(); }
console.log('Captured four real 1440px website previews.');
