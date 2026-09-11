import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import axe from 'axe-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { designs } from './sync-premium-showcase.mjs';

const base = (process.env.QA_BASE_URL || 'http://127.0.0.1:4321').replace(/\/$/,'');
const output = resolve('artifacts/premium-showcase/integrated');
const pages = ['index.html','what-we-acquire.html','sell-your-business.html'];
const report = {base, pages:[], interactions:[], failures:[]};
await mkdir(output,{recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
const check = async (name, fn) => {
  try { await fn(); report.interactions.push({name,pass:true}); }
  catch (error) { report.failures.push(`${name}: ${error.message}`); }
};

async function fillInquiry(page) {
  await page.locator('[name="fullName"]').fill('Local QA Owner');
  await page.locator('[name="email"]').fill('qa@example.test');
  await page.locator('[name="company"]').fill('Local QA Company');
  await page.locator('[name="location"]').fill('Test City');
  await page.locator('[name="industry"]').selectOption('manufacturing');
  await page.locator('[name="ebitda"]').selectOption('1m-2m');
  const role = page.locator('[name="role"]');
  if (await role.first().evaluate(el => el.tagName === 'SELECT')) await role.selectOption('owner');
  else await page.locator('[name="role"][value="owner"]').check();
  await page.locator('[name="message"]').fill('This is a local test of the owner introduction form and must never leave the test browser.');
  await page.locator('[name="acknowledgement"]').check();
}

try {
  for (const width of (process.env.QA_INTERACTIONS_ONLY ? [] : [390,768,1440])) {
    const context = await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const slug of designs) for (const route of pages) {
      const name = `${slug}/${route} @${width}`;
      await check(name, async () => {
        errors.length = 0;
        const response = await page.goto(`${base}/showcase/${slug}/${route}`,{waitUntil:'networkidle'});
        assert.equal(response.status(),200);
        await page.evaluate(() => document.fonts.ready);
        // Reach lower images before taking full-page evidence.
        await page.evaluate(async () => {
          const images = [...document.images];
          images.forEach(image => image.loading = 'eager');
          await Promise.all(images.map(image => image.decode().catch(() => {})));
        });
        await page.addScriptTag({content:axe.source});
        const data = await page.evaluate(async () => {
          const audit = await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});
          return {
            h1:document.querySelectorAll('h1').length,
            overflow:document.documentElement.scrollWidth > innerWidth+1,
            brokenImages:[...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i=>i.src),
            violations:audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),
            externalAssets:[...document.querySelectorAll('script[src],link[rel="stylesheet"]')].map(e=>e.src||e.href).filter(url=>new URL(url).origin!==location.origin),
          };
        });
        report.pages.push({slug,route,width,...data,errors:[...errors]});
        await page.screenshot({path:join(output,`${slug}-${route.replace('.html','')}-${width}.png`),fullPage:true});
        assert.equal(data.h1,1,'one H1');
        assert.equal(data.overflow,false,'no horizontal overflow');
        assert.equal(data.brokenImages.length,0,'all images loaded');
        assert.equal(errors.length,0,`no JS errors: ${errors.join(';')}`);
        assert.equal(data.externalAssets.length,0,'CSS and JS self hosted');
        const severe = data.violations.filter(v=>['serious','critical'].includes(v.impact));
        assert.equal(severe.length,0,`axe: ${severe.map(v=>v.id).join(', ')}`);
        assert.equal(await page.locator('.hb-design-return').getAttribute('href'),'../choose-design.html');
      });
    }
    await context.close();
  }

  const page = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  for (const width of [390,768,1440]) await check(`Chooser layout and accessibility @${width}`, async () => {
    await page.setViewportSize({width,height:1000});
    await page.goto(`${base}/showcase/choose-design.html`,{waitUntil:'networkidle'});
    await page.addScriptTag({content:axe.source});
    const result = await page.evaluate(async () => ({
      overflow:document.documentElement.scrollWidth > innerWidth+1,
      brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,
      violations:(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,impact:v.impact})),
    }));
    assert.equal(result.overflow,false);
    assert.equal(result.brokenImages,0);
    assert.equal(result.violations.filter(v=>['serious','critical'].includes(v.impact)).length,0,JSON.stringify(result.violations));
    await page.screenshot({path:join(output,`chooser-${width}.png`),fullPage:true});
  });
  await check('Chooser offers all four designs and return tab reveals on focus', async () => {
    await page.goto(`${base}/showcase/choose-design.html`,{waitUntil:'networkidle'});
    assert.equal(await page.locator('.design-card').count(),4);
    await page.locator('[data-design="atelier"] .preview').click();
    const back = page.locator('.hb-design-return');
    await back.focus();
    assert.ok((await back.boundingBox()).width >= 180);
    await back.click();
    assert.ok(page.url().endsWith('choose-design.html'));
  });

  for (const slug of designs) {
    await page.goto(`${base}/showcase/${slug}/index.html`,{waitUntil:'networkidle'});
    await check(`${slug}: industry selection explains all nine sectors`, async () => {
      const choices = page.locator('summary[data-sector],button[data-sector],button[data-evergreen-sector]');
      assert.equal(await choices.count(),9);
      for (const choice of await choices.all()) {
        if (await choice.evaluate(el => el.tagName === 'SUMMARY' && el.parentElement.open)) await choice.click();
        await choice.click();
        assert.ok(await choice.evaluate(el => el.tagName==='SUMMARY' ? el.parentElement.open : el.getAttribute('aria-pressed')==='true'));
      }
    });
    await check(`${slug}: FAQ opens with keyboard`, async () => {
      const faq = page.locator('details:not(.sector-fallback):visible').filter({has:page.locator('summary')}).filter({hasNot:page.locator('summary[data-sector]')}).first();
      await faq.locator('summary').focus();
      if (await faq.evaluate(el=>el.open)) await faq.locator('summary').press('Enter');
      await faq.locator('summary').press('Enter');
      assert.ok(await faq.evaluate(el=>el.open));
      await faq.locator('summary').press('Enter');
      assert.equal(await faq.evaluate(el=>el.open),false);
    });
    await check(`${slug}: mobile navigation opens`, async () => {
      await page.setViewportSize({width:390,height:844});
      const menu = page.locator('[data-menu],[data-menu-toggle],[data-evergreen-menu]').first();
      await menu.click();
      assert.equal(await menu.getAttribute('aria-expanded'),'true');
      await menu.click();
      assert.equal(await menu.getAttribute('aria-expanded'),'false');
      await page.setViewportSize({width:1440,height:1000});
    });
    await page.goto(`${base}/showcase/${slug}/sell-your-business.html`,{waitUntil:'networkidle'});
    let calls = 0;
    let reply = {status:503,body:{ok:false,message:'Online submission is not yet connected. No information was delivered.'}};
    await page.route('**/api/inquiries',async route => {
      calls++;
      const payload = new URLSearchParams(route.request().postData());
      for (const key of ['fullName','email','company','location','industry','ebitda','role','message','acknowledgement']) assert.ok(payload.get(key),`required ${key}`);
      assert.equal(payload.get('industry'),'manufacturing');
      assert.equal(payload.get('role'),'owner');
      await route.fulfill({status:reply.status,contentType:'application/json',body:JSON.stringify(reply.body)});
    });
    await check(`${slug}: invalid form prevents submission`,async()=>{
      await page.locator('[data-owner-form] button[type="submit"]').click();
      assert.equal(calls,0);
      assert.equal(await page.locator('[data-owner-form]').evaluate(form=>form.checkValidity()),false);
    });
    await check(`${slug}: service error is honest and retains entries`,async()=>{
      await fillInquiry(page);
      await page.locator('[data-owner-form] button[type="submit"]').click();
      await page.waitForFunction(()=>document.querySelector('[data-form-status]').textContent.includes('No information was delivered'));
      assert.equal(await page.locator('[name="fullName"]').inputValue(),'Local QA Owner');
    });
    await check(`${slug}: successful server confirmation resets form`,async()=>{
      reply={status:200,body:{ok:true,message:'Your confidential introduction has been received.'}};
      await page.locator('[data-owner-form] button[type="submit"]').click();
      await page.waitForFunction(()=>document.querySelector('[data-form-status]').textContent.includes('has been received'));
      assert.equal(await page.locator('[name="fullName"]').inputValue(),'');
    });
    await page.unroute('**/api/inquiries');
  }
  await page.close();

  for (const slug of designs.slice(1)) await check(`${slug}: source folder opens directly as local HTML`, async()=>{
    const page = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    await page.goto(pathToFileURL(resolve('Hyper boards DEMO',slug,'index.html')).href,{waitUntil:'networkidle'});
    assert.ok(await page.locator('h1').isVisible());
    assert.equal(await page.evaluate(()=>[...document.images].filter(i=>i.loading!=='lazy'&&(!i.complete||!i.naturalWidth)).length),0);
    await page.locator('a[href="sell-your-business.html"]').first().click();
    assert.ok(await page.locator('[data-owner-form]').isVisible());
    await page.close();
  });

  for (const slug of designs.slice(1)) await check(`${slug}: no-JavaScript content and navigation remain usable`, async()=>{
    const context = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
    const page = await context.newPage();
    await page.goto(`${base}/showcase/${slug}/index.html`);
    assert.ok(await page.locator('h1').isVisible());
    const summary = page.locator('summary[data-sector]').first();
    if (await summary.count()) { if (await summary.locator('..').getAttribute('open') === null) await summary.click(); assert.ok(await summary.locator('..').getAttribute('open') !== null); }
    const owner = page.locator('a[href="sell-your-business.html"]:visible').first();
    await owner.click();
    assert.ok(await page.locator('[data-owner-form]').isVisible());
    await context.close();
  });
} finally {
  await browser.close();
  await writeFile(join(output,process.env.QA_INTERACTIONS_ONLY ? 'interaction-report.json' : 'report.json'),JSON.stringify(report,null,2));
}
console.log(`${report.pages.length} responsive page checks; ${report.interactions.length} total checks passed; ${report.failures.length} failures.`);
if (report.failures.length) { console.error(report.failures.join('\n')); process.exitCode=1; }
