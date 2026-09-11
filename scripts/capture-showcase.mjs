import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { designs } from './sync-premium-showcase.mjs';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4323';
const destination = resolve('Hyper boards DEMO/showcase-assets');
await mkdir(destination, {recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
try {
  const page = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const routes = [...designs.map(slug => `/showcase/${slug}/index.html`), '/design-content/hyperboards'];
  for (const [index, route] of routes.entries()) {
    await page.goto(`${base}${route}`, {waitUntil:'networkidle'});
    await page.addStyleTag({content:'astro-dev-toolbar { display:none !important }'});
    await page.evaluate(() => document.fonts.ready);
    await sharp(await page.screenshot({type:'png'})).webp({quality:86,effort:5}).toFile(join(destination,`design-${index+1}.webp`));
  }
} finally { await browser.close(); }
console.log('Captured nine real 1440px website previews.');
