import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright-core';

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
let browser;
let page;

before(async () => {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page = await context.newPage();
});

after(async () => {
  await browser?.close();
});

test('the original design uses lighter leather without stitches or corner screws', async () => {
  const routes = [
    '/design-content/hyperboards',
    '/what-we-acquire',
    '/business-owners',
    '/our-approach',
    '/about',
    '/contact',
    '/investor-relationships',
  ];

  for (const route of routes) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    assert.equal(response?.status(), 200, `${route} should load`);

    const contract = await page.evaluate(() => {
      const seamUsers = [];
      for (const element of document.querySelectorAll('*')) {
        for (const pseudo of [null, '::before', '::after']) {
          const image = getComputedStyle(element, pseudo).backgroundImage;
          if (image.includes('saddle-stitch')) {
            seamUsers.push(`${element.tagName.toLowerCase()}.${element.className || ''}${pseudo || ''}`);
          }
        }
      }

      const hero = document.querySelector('.hero');
      const heroColor = hero ? getComputedStyle(hero).backgroundColor.match(/\d+/g)?.map(Number) || [] : [];
      return {
        seamUsers,
        cornerHardware: document.querySelectorAll('.case-frame__corner').length,
        heroColor,
        heroTexture: hero ? getComputedStyle(hero).backgroundImage : '',
      };
    });

    assert.deepEqual(contract.seamUsers, [], `${route} must not render decorative stitching`);
    assert.equal(contract.cornerHardware, 0, `${route} must not render screw-like corner hardware`);

    if (route === '/design-content/hyperboards') {
      assert.ok(contract.heroColor.reduce((sum, channel) => sum + channel, 0) >= 140, 'the navy hero should resolve to a lighter tone');
      assert.match(contract.heroTexture, /leather-relief\.jpg/, 'the lighter original should retain subtle leather character');
    }
  }
});

test('both Evergreen versions omit the dynamic side-dot navigation', async () => {
  for (const slug of ['evergreen-partner', 'evergreen-partner-refined']) {
    const response = await page.goto(`${baseUrl}/designs/${slug}`, { waitUntil: 'domcontentloaded' });
    assert.equal(response?.status(), 200, `${slug} preview should load`);
    const frame = await (await page.locator('iframe').elementHandle())?.contentFrame();
    assert.ok(frame, `${slug} should expose its preview frame`);
    await frame.waitForLoadState('domcontentloaded');
    assert.equal(await frame.locator('.evergreen-section-index').count(), 0, `${slug} must not show the side-dot rail`);
  }
});
