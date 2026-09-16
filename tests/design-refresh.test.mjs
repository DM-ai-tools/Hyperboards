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
  assert.equal(new URL(page.url()).pathname, '/');
  assert.equal(await page.title(), 'Hyperboards | Private Business Acquisitions');
  assert.match(await page.locator('h1').innerText(), /A direct buyer for the business you built/i);
  assert.equal(await page.locator('.design-card').count(), 0, 'the default homepage presents Evergreen rather than approval choices');
  assert.ok(await page.locator('a[href="/sell-your-business"]').count() > 0, 'Evergreen keeps its owner introduction route');
  assert.ok(await page.locator('a[href="/acquisition-criteria"]').count() > 0, 'Evergreen keeps its acquisition route');

  const galleryResponse = await page.goto(`${baseUrl}/designs`, { waitUntil: 'networkidle' });
  assert.equal(galleryResponse?.status(), 200, 'the design chooser should remain available');
  assert.equal(await page.locator('.design-card').count(), 3);
  const selectedCard = page.locator('[data-design="evergreen-partner-refined"]');
  assert.equal((await selectedCard.locator('figcaption').textContent())?.trim(), 'Selected design');

  await selectedCard.locator('a').click();
  await page.waitForLoadState('domcontentloaded');
  assert.equal(await page.locator('.all-designs').getAttribute('href'), '/designs');
});

test('finalized Evergreen uses a consistent, readable three-level heading system', async () => {
  const collectType = async (route) => {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    assert.equal(response?.status(), 200, `${route} should load`);

    return page.evaluate(() => {
      const pixels = (selector) => {
        const element = document.querySelector(selector);
        return element ? Number.parseFloat(getComputedStyle(element).fontSize) : 0;
      };

      return {
        h1: pixels('main h1'),
        h2: [...document.querySelectorAll('main h2')].map((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
        h3: [...document.querySelectorAll('main h3')].map((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
        lede: pixels('.evergreen-hero__lede, .inner-hero__lede'),
        navigation: pixels('.evergreen-nav a'),
        conversation: pixels('.evergreen-header__action'),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
  };

  const home = await collectType('/');
  const acquire = await collectType('/acquisition-criteria');
  const contact = await collectType('/sell-your-business');

  for (const [route, type] of [['/', home], ['/acquisition-criteria', acquire], ['/sell-your-business', contact]]) {
    assert.ok(type.h1 >= 72, `${route} should retain a confident desktop H1`);
    assert.ok(type.lede >= 17, `${route} supporting introduction should remain comfortably readable`);
    assert.ok(type.navigation >= 13, `${route} navigation should not render as fine print`);
    assert.ok(type.conversation >= 15, `${route} conversation action should carry stronger visual prominence`);
    assert.ok(type.conversation > type.navigation, `${route} conversation action should outrank navigation text`);
    assert.ok(Math.abs(type.conversation - type.lede) <= 1, `${route} conversation action should share the supporting H2 scale`);
    assert.ok(type.overflow <= 1, `${route} should not overflow horizontally`);
  }

  assert.ok(Math.abs(home.h1 - acquire.h1) <= 2, 'homepage and acquisition-page H1s should share one display scale');
  assert.ok(Math.abs(home.h1 - contact.h1) <= 2, 'homepage and conversation-page H1s should share one display scale');
  assert.ok(home.h2.length >= 5, 'homepage should expose the section-heading level throughout');
  assert.ok(home.h3.length >= 10, 'homepage should expose the tertiary-heading level throughout');
  assert.ok(Math.max(...home.h2) - Math.min(...home.h2) <= 2, 'homepage H2s should resolve to one consistent scale');
  assert.ok(Math.max(...home.h3) - Math.min(...home.h3) <= 2, 'homepage H3s should resolve to one consistent scale');
});

test('finalized Evergreen keeps the hero grid visible without overpowering the white canvas', async () => {
  const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
  assert.equal(response?.status(), 200, 'the finalized homepage should load');

  const grid = await page.locator('.evergreen-hero').evaluate((hero) => {
    const style = getComputedStyle(hero, '::before');
    return {
      opacity: Number.parseFloat(style.opacity),
      backgroundImage: style.backgroundImage,
    };
  });

  assert.match(grid.backgroundImage, /linear-gradient/, 'the hero should retain its structural grid');
  assert.ok(grid.opacity > 0.5, 'the grid should remain visibly present against the white canvas');
  assert.ok(grid.opacity <= 0.6, 'the grid should remain a restrained background detail');
});

test('finalized Evergreen preserves the original typeface roles while standardizing heading sizes', async () => {
  const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
  assert.equal(response?.status(), 200, 'the finalized homepage should load');

  const typography = await page.evaluate(() => {
    const family = (selector) => getComputedStyle(document.querySelector(selector)).fontFamily;
    return {
      body: family('body'),
      hero: family('.evergreen-hero h1'),
      exactDisplayFaceLoaded: document.fonts.check('500 6rem "Literata Display"'),
      tertiary: [...document.querySelectorAll('.evergreen-owner-grid h3, .evergreen-process h3')]
        .map((element) => getComputedStyle(element).fontFamily),
    };
  });

  assert.notEqual(typography.hero, typography.body, 'the original editorial hero should retain its serif display face');
  assert.match(typography.hero, /^"?Literata Display"?/, 'the hero should use the exact variable optical-size Literata reference face');
  assert.equal(typography.exactDisplayFaceLoaded, true, 'the exact self-hosted display face should finish loading');
  assert.ok(typography.tertiary.length > 0, 'the homepage should expose tertiary headings');
  assert.ok(
    typography.tertiary.every((fontFamily) => fontFamily === typography.body),
    'tertiary headings should retain the original sans-serif face instead of inheriting the size pass as a style change',
  );
});

test('finalized Evergreen leaves clear vertical space around headline descenders', async () => {
  const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
  assert.equal(response?.status(), 200, 'the finalized homepage should load');

  const spacing = await page.locator('.evergreen-hero h1').evaluate((element) => {
    const style = getComputedStyle(element);
    return Number.parseFloat(style.lineHeight) / Number.parseFloat(style.fontSize);
  });

  assert.ok(spacing >= 1.01, 'headline line boxes should not overlap descenders with the following line');
  assert.ok(spacing <= 1.04, 'the spacing correction should remain visually restrained');
});

test('finalized Evergreen enlarges the acquisition profile panel by ten percent on desktop', async () => {
  const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
  assert.equal(response?.status(), 200, 'the finalized homepage should load');

  const panel = await page.locator('.evergreen-profile').evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      widthRatio: bounds.width / element.offsetWidth,
      heightRatio: bounds.height / element.offsetHeight,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  assert.ok(Math.abs(panel.widthRatio - 1.1) <= 0.015, 'the panel should be visually 10% wider');
  assert.ok(Math.abs(panel.heightRatio - 1.1) <= 0.015, 'the panel should be visually 10% taller');
  assert.ok(panel.overflow <= 1, 'the larger panel should not create horizontal overflow');
});
