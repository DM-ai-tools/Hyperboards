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

test('Design 2 alone presents warm-white pages with navy information panels and gold hierarchy', async () => {
  const response = await page.goto(`${baseUrl}/designs/evergreen-partner`, { waitUntil: 'domcontentloaded' });
  assert.equal(response?.status(), 200, 'Design 2 preview should load');
  const frame = await (await page.locator('iframe').elementHandle())?.contentFrame();
  assert.ok(frame, 'Design 2 should expose its preview frame');
  await frame.waitForLoadState('domcontentloaded');

  const palette = await frame.evaluate(() => {
    const value = (selector, property = 'backgroundColor') => {
      const element = document.querySelector(selector);
      return element ? getComputedStyle(element)[property] : '';
    };

    return {
      page: value('body'),
      ownerPanel: value('.evergreen-owner-grid__item'),
      mandatePanel: value('.evergreen-acquire__criteria'),
      ownerIndex: value('.evergreen-owner-grid__item span', 'color'),
      mandateIndex: value('.evergreen-acquire__criteria span', 'color'),
    };
  });

  assert.match(palette.page, /oklch\(0\.965 0\.012 89\)|rgb\(24[0-9][ ,]/, 'Design 2 should retain its warm-white page canvas');
  for (const [name, value] of [['owner panel', palette.ownerPanel], ['mandate panel', palette.mandatePanel]]) {
    const color = (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    assert.equal(color.length, 3, `${name} should resolve to an opaque RGB color`);
    assert.ok(color[2] > color[1] && color[1] > color[0], `${name} should resolve to deep navy rather than green`);
  }
  for (const [name, value] of [['owner index', palette.ownerIndex], ['mandate index', palette.mandateIndex]]) {
    const color = (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    assert.equal(color.length, 3, `${name} should resolve to an RGB text color`);
    assert.ok(color[0] > color[1] && color[1] > color[2], `${name} should use a warm gold hierarchy color`);
  }

  const refinedResponse = await page.goto(`${baseUrl}/designs/evergreen-partner-refined`, { waitUntil: 'domcontentloaded' });
  assert.equal(refinedResponse?.status(), 200, 'Design 3 preview should load');
  const refinedFrame = await (await page.locator('iframe').elementHandle())?.contentFrame();
  assert.ok(refinedFrame, 'Design 3 should expose its preview frame');
  await refinedFrame.waitForLoadState('domcontentloaded');
  const refinedMandate = await refinedFrame.locator('.evergreen-acquire__criteria').evaluate((element) => getComputedStyle(element).backgroundImage);
  assert.match(refinedMandate, /oklch\([^)]*16[345]\)/, 'Design 3 should retain its established forest-green panel system');
});

test('the default homepage opens finalized Evergreen while the legacy gallery remains available', async () => {
  const homepageResponse = await page.goto(baseUrl, { waitUntil: 'networkidle' });
  assert.equal(homepageResponse?.status(), 200, 'the selected homepage should load');
  assert.equal(new URL(page.url()).pathname, '/design-previews/evergreen-partner-refined/index.html');
  assert.match(await page.locator('h1').innerText(), /A direct buyer for the business you built/i);
  assert.equal(await page.locator('.design-card').count(), 0, 'the default homepage presents Evergreen rather than approval choices');
  assert.ok(await page.locator('a[href="sell-your-business.html"]').count() > 0, 'Evergreen keeps its owner introduction route');
  assert.ok(await page.locator('a[href="what-we-acquire.html"]').count() > 0, 'Evergreen keeps its acquisition route');

  const galleryResponse = await page.goto(`${baseUrl}/designs`, { waitUntil: 'networkidle' });
  assert.equal(galleryResponse?.status(), 200, 'the design chooser should remain available');
  assert.equal(await page.locator('.design-card').count(), 3);
  const selectedCard = page.locator('[data-design="evergreen-partner-refined"]');
  assert.equal((await selectedCard.locator('figcaption').textContent())?.trim(), 'Selected design');

  await selectedCard.locator('a').click();
  await page.waitForLoadState('domcontentloaded');
  assert.equal(await page.locator('.all-designs').getAttribute('href'), '/designs');
});
