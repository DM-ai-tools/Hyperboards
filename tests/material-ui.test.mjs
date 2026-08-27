import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright-core';

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const leatherUrl = `${baseUrl}/design-content/hyperboards`;
let browser;
let page;

before(async () => {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  page = await context.newPage();
});

after(async () => {
  await browser?.close();
});

test('the case frame is decorative, stitched, and backed by local texture assets', async () => {
  await page.goto(leatherUrl, { waitUntil: 'networkidle' });

  const frameContract = await page.evaluate(() => {
    const frames = document.querySelectorAll('.case-frame');
    const frame = frames[0];
    if (!(frame instanceof HTMLElement)) {
      return { count: frames.length };
    }

    const frameStyle = getComputedStyle(frame);
    const stitchStyle = getComputedStyle(frame, '::after');
    const rail = frame.querySelector('.case-frame__rail--left');
    return {
      count: frames.length,
      ariaHidden: frame.getAttribute('aria-hidden'),
      pointerEvents: frameStyle.pointerEvents,
      position: frameStyle.position,
      stitchStyle: stitchStyle.borderTopStyle,
      stitchPattern: stitchStyle.backgroundImage,
      stitchSize: stitchStyle.backgroundSize,
      railWidth: rail instanceof HTMLElement ? Number.parseFloat(getComputedStyle(rail).width) : 0,
    };
  });

  assert.equal(frameContract.count, 1, 'one decorative viewport frame should render');
  assert.equal(frameContract.ariaHidden, 'true');
  assert.equal(frameContract.pointerEvents, 'none');
  assert.equal(frameContract.position, 'fixed');
  assert.equal(frameContract.stitchStyle, 'none');
  assert.match(frameContract.stitchPattern, /saddle-stitch-horizontal\.svg/);
  assert.match(frameContract.stitchPattern, /saddle-stitch-vertical\.svg/);
  assert.match(frameContract.stitchSize, /^36px 6px/, 'the perimeter seam should be half the previous scale');
  assert.ok(frameContract.railWidth >= 14, 'the desktop saddle seam should sit fully inside the leather rail');

  for (const asset of [
    '/assets/leather-relief.jpg',
    '/assets/saddle-stitch-horizontal.svg',
    '/assets/saddle-stitch-vertical.svg',
    '/assets/saddle-stitch-navy-horizontal.svg',
    '/assets/saddle-stitch-navy-vertical.svg',
    '/assets/paper-grain.svg',
  ]) {
    const response = await page.request.get(`${baseUrl}${asset}`);
    assert.equal(response.status(), 200, `${asset} should be served locally`);
    assert.match(
      response.headers()['content-type'] || '',
      asset.endsWith('.jpg') ? /image\/jpeg/ : /image\/svg\+xml/,
    );
  }
});

test('primary dark and paper surfaces resolve the approved material textures', async () => {
  await page.goto(leatherUrl, { waitUntil: 'networkidle' });

  const surfaces = await page.evaluate(() => {
    const background = (selector) => {
      const element = document.querySelector(selector);
      return element instanceof HTMLElement ? getComputedStyle(element).backgroundImage : '';
    };

    return {
      header: background('.site-header'),
      hero: background('.hero'),
      process: background('.section--navy'),
      cta: background('.cta-band'),
      footer: background('.site-footer'),
      paper: background('.section--paper'),
      ctaEyebrow: getComputedStyle(document.querySelector('.cta-band .eyebrow')).color,
      heroColor: getComputedStyle(document.querySelector('.hero')).backgroundColor,
      heroBlend: getComputedStyle(document.querySelector('.hero')).backgroundBlendMode,
    };
  });

  for (const selector of ['header', 'hero', 'process', 'cta', 'footer']) {
    assert.match(surfaces[selector], /leather-relief\.jpg/, `${selector} should render the navy relief texture`);
    assert.doesNotMatch(surfaces[selector], /leather-natural\.jpg/, `${selector} must not use the photograph as its color field`);
  }
  assert.equal(surfaces.heroColor, 'rgb(11, 27, 54)', 'the hero should retain the original navy base');
  assert.match(surfaces.heroBlend, /soft-light/, 'the leather image should behave as a relief layer');
  assert.match(surfaces.paper, /paper-grain\.svg/, 'paper sections should render the paper grain');
  assert.equal(surfaces.ctaEyebrow, 'rgb(232, 217, 167)', 'CTA eyebrow should remain legible on leather');
});

test('conversion controls and core content modules expose tactile casework treatments', async () => {
  await page.goto(leatherUrl, { waitUntil: 'networkidle' });

  const treatments = await page.evaluate(() => {
    const primary = document.querySelector('.button--primary');
    const heroArt = document.querySelector('.hero-art');
    const sector = document.querySelector('.sector-grid li');
    const process = document.querySelector('.process');
    const sellerPlaque = document.querySelector('.owner-context__aside');

    return {
      primaryStitch: primary ? getComputedStyle(primary, '::before').backgroundImage : '',
      primaryStitchBorder: primary ? getComputedStyle(primary, '::before').borderTopStyle : '',
      primaryStitchSize: primary ? getComputedStyle(primary, '::before').backgroundSize : '',
      primaryCarrier: primary ? getComputedStyle(primary).backgroundImage : '',
      primaryCarrierColor: primary ? getComputedStyle(primary).backgroundColor : '',
      primaryInset: primary ? Number.parseFloat(getComputedStyle(primary, '::before').left) : 0,
      primaryPlate: primary ? getComputedStyle(primary, '::after').backgroundImage : '',
      primaryShadow: primary ? getComputedStyle(primary).boxShadow : 'none',
      heroBorder: heroArt ? getComputedStyle(heroArt).borderTopStyle : 'none',
      sectorRadius: sector ? Number.parseFloat(getComputedStyle(sector).borderTopLeftRadius) : 0,
      processTexture: process ? getComputedStyle(process).backgroundImage : '',
      sellerPlaqueColor: sellerPlaque ? getComputedStyle(sellerPlaque).backgroundColor : 'rgba(0, 0, 0, 0)',
    };
  });

  assert.match(treatments.primaryStitch, /saddle-stitch-navy-horizontal\.svg/);
  assert.match(treatments.primaryStitch, /saddle-stitch-navy-vertical\.svg/);
  assert.equal(treatments.primaryStitchBorder, 'none');
  assert.match(treatments.primaryStitchSize, /^24px 4px/, 'control seams should be finer than panel seams');
  assert.doesNotMatch(treatments.primaryCarrier, /leather-relief\.jpg/);
  assert.equal(treatments.primaryCarrierColor, 'rgb(199, 168, 91)', 'the CTA carrier must be brass');
  assert.ok(treatments.primaryInset >= 5, 'the navy saddle seam must sit inside the brass face');
  assert.notEqual(treatments.primaryPlate, 'none', 'the CTA should retain a dimensional brass highlight');
  assert.notEqual(treatments.primaryShadow, 'none');
  assert.notEqual(treatments.heroBorder, 'none');
  assert.ok(treatments.sectorRadius >= 4, 'sector cards should have a tactile folio edge');
  assert.match(treatments.processTexture, /leather-relief\.jpg/);
  assert.notEqual(treatments.sellerPlaqueColor, 'rgba(0, 0, 0, 0)');
});

test('the material frame preserves semantic structures and mobile width', async () => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(leatherUrl, { waitUntil: 'networkidle' });

  const mobileContract = await page.evaluate(() => {
    const frame = document.querySelector('.case-frame');
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      frameWidth: frame instanceof HTMLElement ? frame.getBoundingClientRect().width : 0,
      sectorsTag: document.querySelector('.sector-grid')?.tagName,
      processTag: document.querySelector('.process')?.tagName,
      faqTag: document.querySelector('.faq-list > :first-child')?.tagName,
    };
  });

  assert.equal(mobileContract.overflow, false);
  assert.ok(mobileContract.frameWidth <= 320, 'the decorative frame must remain inside the viewport');
  assert.equal(mobileContract.sectorsTag, 'OL');
  assert.equal(mobileContract.processTag, 'OL');
  assert.equal(mobileContract.faqTag, 'DETAILS');

  await page.goto(`${baseUrl}/contact`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('form[action="/api/inquiries"]').count(), 1);
});

test('secondary routes inherit the same leather and paper craft language', async () => {
  await page.setViewportSize({ width: 1200, height: 900 });

  const routeContracts = [
    ['/business-owners', '.owner-map', 'paper-grain.svg', 4, true],
    ['/about', '.role-comparator__document', 'paper-grain.svg', 0, true],
    ['/our-approach', '.lens', 'leather-relief.jpg', 4, true],
    ['/investor-relationships', '.ledger', 'paper-grain.svg', 0, true],
    ['/privacy', '.privacy-reader', 'paper-grain.svg', 0, false],
    ['/terms', '.terms', 'paper-grain.svg', 0, false],
    ['/thank-you', '.receipt', 'paper-grain.svg', 0, false],
  ];

  for (const [route, selector, texture, minimumRadius, expectsBorder] of routeContracts) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    const contract = await page.locator(selector).first().evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundImage: style.backgroundImage,
        borderRadius: Number.parseFloat(style.borderTopLeftRadius),
        borderStyle: style.borderTopStyle,
      };
    });

    assert.match(contract.backgroundImage, new RegExp(texture.replace('.', '\\.')), `${route} should use ${texture}`);
    assert.ok(contract.borderRadius >= minimumRadius, `${route} should preserve its intended folio edge`);
    if (expectsBorder) assert.notEqual(contract.borderStyle, 'none', `${route} should expose a material boundary`);
    else assert.equal(contract.borderStyle, 'none', `${route} should remain a native edge-to-edge document`);
  }
});

test('major leather pieces use dimensional saddle stitching instead of dashed borders', async () => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  const routeContracts = [
    ['/design-content/hyperboards', [
      ['.owner-context__aside', '::before'],
      ['.cta-band__inner', '::before'],
      ['.hero-art', '::before'],
      ['.process li', '::after'],
    ]],
    ['/contact', [
      ['.inquiry-shell', '::before'],
      ['.submit-button', '::before'],
    ]],
    ['/our-approach', [
      ['.lens', '::before'],
    ]],
  ];

  for (const [route, selectors] of routeContracts) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });

    for (const [selector, pseudo] of selectors) {
      const stitch = await page.locator(selector).first().evaluate((element, pseudoElement) => {
        const style = getComputedStyle(element, pseudoElement);
        const elementStyle = getComputedStyle(element);
        return {
          image: style.backgroundImage,
          size: style.backgroundSize,
          borderStyle: style.borderTopStyle,
          shadow: style.boxShadow,
          elementBorderWidth: Number.parseFloat(elementStyle.borderTopWidth),
          elementBackgroundClip: elementStyle.backgroundClip,
        };
      }, pseudo);

      assert.match(stitch.image, /saddle-stitch-horizontal\.svg/, `${selector}${pseudo} needs saddle thread`);
      assert.match(stitch.image, /saddle-stitch-vertical\.svg/, `${selector}${pseudo} needs vertical saddle thread`);
      assert.equal(stitch.borderStyle, 'none', `${selector}${pseudo} must not use a dashed CSS border`);
      assert.notEqual(stitch.shadow, 'none', `${selector}${pseudo} needs a recessed stitch channel`);
      if (['.owner-context__aside', '.cta-band__inner', '.hero-art', '.inquiry-shell', '.lens'].includes(selector)) {
        assert.match(stitch.size, /^28px 5px/, `${selector}${pseudo} should use the finer panel seam`);
      }
      if (selector === '.inquiry-shell') {
        assert.ok(stitch.elementBorderWidth >= 12, 'the form seam should stay inside a substantial leather rail');
        assert.match(
          stitch.elementBackgroundClip,
          /^padding-box, padding-box, padding-box, border-box/,
          'the paper body must mask the leather rail beneath the form fields',
        );
      }
    }
  }
});

test('paper tiles have layered depth and responsive lift without losing their material boundary', async () => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(leatherUrl, { waitUntil: 'networkidle' });

  const selectors = ['.principles article', '.sector-grid li', '.faq-list details'];
  for (const selector of selectors) {
    const tile = page.locator(selector).first();
    const treatment = await tile.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        shadowLayers: (style.boxShadow.match(/rgba\(/g) || []).length,
        backgroundImage: style.backgroundImage,
      };
    });

    assert.ok(treatment.shadowLayers >= 3, `${selector} should have highlight, contact and cast-shadow depth`);
    assert.match(treatment.backgroundImage, /paper-grain\.svg/, `${selector} should retain the paper material`);
  }

  const sector = page.locator('.sector-grid li').first();
  await sector.hover();
  await page.waitForTimeout(260);
  assert.notEqual(await sector.evaluate((element) => getComputedStyle(element).transform), 'none', 'interactive tiles should lift subtly');
});

test('brass corners and the acquisition chart expose realistic hardware, grid, and restrained motion', async () => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(leatherUrl, { waitUntil: 'networkidle' });

  const contract = await page.evaluate(() => {
    const corner = document.querySelector('.case-frame__corner');
    const node = document.querySelector('.hero-art__node');
    const cornerBefore = corner ? getComputedStyle(corner, '::before') : null;
    return {
      cornerScrew: cornerBefore?.content || 'none',
      cornerScrewFinish: cornerBefore?.backgroundImage || 'none',
      cornerDepth: corner ? getComputedStyle(corner).boxShadow : 'none',
      minorGrid: document.querySelectorAll('.hero-art__minor-grid').length,
      axisLabels: document.querySelectorAll('.hero-art__axis-labels').length,
      nodeMotion: node ? getComputedStyle(node).animationName : 'none',
    };
  });

  assert.notEqual(contract.cornerScrew, 'none', 'corner plates should include a physical screw head');
  assert.match(contract.cornerScrewFinish, /radial-gradient/, 'corner screws should have a metallic radial finish');
  assert.notEqual(contract.cornerDepth, 'none');
  assert.equal(contract.minorGrid, 1, 'the chart should include a dedicated minor grid');
  assert.equal(contract.axisLabels, 1, 'the chart should include restrained axis notation');
  assert.notEqual(contract.nodeMotion, 'none', 'growth nodes should provide the signature motion moment');
});

test('the acquisition approach remains within the tablet viewport', async () => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto(`${baseUrl}/our-approach`, { waitUntil: 'networkidle' });

  const widthContract = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));

  assert.ok(
    widthContract.content <= widthContract.viewport + 1,
    `approach content width ${widthContract.content}px must fit the ${widthContract.viewport}px tablet viewport`,
  );
});
