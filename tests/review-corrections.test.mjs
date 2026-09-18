import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { chromium } from 'playwright-core';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
let browser;
let page;
before(async () => {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(4000);
});
after(async () => browser?.close());

test('body punctuation uses proportional glyph spacing without changing the approved typeface', async () => {
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  const result = await page.locator('.evergreen-hero__lede').evaluate((el) => {
    const probe = document.createElement('span');
    probe.textContent = ',.';
    probe.style.cssText = 'position:absolute;white-space:pre;font:inherit';
    el.append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.style.fontVariantNumeric = 'normal';
    const normal = probe.getBoundingClientRect().width;
    probe.remove();
    return { width, normal, family: getComputedStyle(el).fontFamily };
  });
  assert.ok(Math.abs(result.width - result.normal) < 1, 'tabular punctuation must not add visible gaps in prose');
  assert.match(result.family, /Schibsted/);
});

test('sentence punctuation has no leading spaces and em dashes have a gap on both sides', async () => {
  for (const route of ['/', '/acquisition-criteria', '/sell-your-business']) {
    await page.goto(`${base}${route}`);
    const prose = await page.locator('main').innerText();
    assert.doesNotMatch(prose, /\w[ \t]+[,.]/);
    assert.doesNotMatch(prose, /\S—|—\S/);
  }
});

test('each acquisition industry reveals its relevant one-line context by keyboard', async () => {
  await page.goto(`${base}/acquisition-criteria`);
  const buttons = page.locator('[data-industry]');
  assert.equal(await buttons.count(), 9);
  for (const [name, phrase] of [
    ['Building & Construction', 'commercial'], ['Communication & Media', 'client'],
    ['Entertainment & Recreation', 'Membership'], ['Financial Services', 'books'],
    ['Health Care & Fitness', 'demand'], ['Manufacturing', 'tangible'],
    ['Online & Technology', 'Scalable'], ['Service Businesses', 'consolidation'],
    ['Wholesale & Distributors', 'supplier'],
  ]) {
    const button = page.getByRole('button', { name: new RegExp(name.replace('&', '&')) });
    await button.focus();
    await page.keyboard.press('Enter');
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    assert.match(await page.locator('[data-industry-copy]').innerText(), new RegExp(phrase, 'i'));
    assert.equal(await page.locator('[data-industry][aria-pressed="true"]').count(), 1);
  }
});

test('process and stewardship dividers leave clear space below their centered circles', async () => {
  for (const width of [1440, 834]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base);
    const measurements = await page.evaluate(() => {
      const nodes = [...document.querySelectorAll('.evergreen-process-line i')];
      const steps = [...document.querySelectorAll('.evergreen-process__steps li')];
      const process = steps.slice(1).flatMap((li, i) => {
        const line = getComputedStyle(li, '::before');
        if (line.display === 'none') return [];
        const rect = li.getBoundingClientRect();
        const node = nodes[i + 1];
        const circleStyle = getComputedStyle(li, '::after');
        const circle = node.getClientRects().length ? node.getBoundingClientRect() : {
          left: rect.left + li.clientLeft + parseFloat(circleStyle.left),
          width: parseFloat(circleStyle.width),
          bottom: rect.top + li.clientTop + parseFloat(circleStyle.top) + parseFloat(circleStyle.height),
        };
        return [{ gap: Math.abs(rect.left + li.clientLeft + parseFloat(line.left) + .5 - (circle.left + circle.width / 2)), clearance: rect.top + li.clientTop + parseFloat(line.top) - circle.bottom, height: parseFloat(line.height) }];
      });
      const stewardship = [...document.querySelectorAll('.evergreen-stewardship__principles li')].slice(1).flatMap((li) => {
        const circle = getComputedStyle(li, '::before');
        const line = getComputedStyle(li, '::after');
        if (line.display === 'none') return [];
        return [{ gap: Math.abs(parseFloat(line.left) + .5 - (parseFloat(circle.left) + parseFloat(circle.width) / 2)), clearance: parseFloat(line.top) - parseFloat(circle.top) - parseFloat(circle.height), height: parseFloat(line.height) }];
      });
      return { process, stewardship };
    });
    for (const group of Object.values(measurements)) {
      assert.equal(group.length, width > 1000 ? 3 : 2);
      assert.ok(group.every(({ gap }) => gap <= 1), JSON.stringify(measurements));
      assert.ok(group.every(({ clearance }) => clearance >= 8 && clearance <= 16), `dividers must visibly clear the circles at ${width}px: ${JSON.stringify(measurements)}`);
      if (width > 1000) assert.ok(Math.max(...group.map(x => x.height)) - Math.min(...group.map(x => x.height)) < 1);
    }
    assert.ok(measurements.stewardship.every(x => x.height < 145), 'stewardship dividers should be compact');
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
});

async function fillIntroduction() {
  await page.goto(`${base}/sell-your-business`);
  assert.equal(await page.locator('form[data-owner-form]').count(), 1, 'restore the structured inquiry form');
  await page.getByLabel('Full name').fill('Review Owner');
  await page.getByLabel('Work email').fill('owner@example.test');
  await page.getByLabel('Company name').fill('Review Company');
  await page.getByLabel('Headquarters').fill('Austin');
  await page.getByLabel('Industry *', { exact: true }).selectOption('manufacturing');
  await page.getByLabel('Approximate EBITDA').selectOption('1m-2m');
  await page.getByLabel('Your role').selectOption('owner');
  await page.getByLabel('What are you considering?').fill('Considering a gradual transition over the next year.');
  await page.getByLabel('I understand').check();
}

test('the restored form blocks empty submissions and prepares a draft without claiming delivery', async () => {
  await page.goto(`${base}/sell-your-business`);
  assert.equal(await page.locator('form[data-owner-form]').count(), 1);
  await page.locator('button[type="submit"]').click();
  assert.equal(await page.locator('[data-email-draft]:visible').count(), 0);
  await fillIntroduction();
  await page.locator('form').evaluate(el => { el.dataset.deliveryMode = 'email'; });
  await page.locator('button[type="submit"]').click();
  const link = await page.locator('[data-email-draft]').getAttribute('href');
  assert.match(decodeURIComponent(link), /Review Company/);
  assert.match(decodeURIComponent(link), /owner@example.test/);
  assert.match(await page.locator('[data-form-status]').innerText(), /not been sent/i);
  assert.equal(await page.getByLabel('Company name').inputValue(), 'Review Company');
});

test('a failed online delivery preserves the form and permits a retry; confirmed delivery resets it', async () => {
  await fillIntroduction();
  await page.locator('form').evaluate(el => { el.dataset.deliveryMode = 'online'; });
  let requests = 0;
  await page.route('**/api/inquiries', async route => {
    requests++;
    assert.equal(route.request().method(), 'POST');
    assert.match(route.request().postData(), /company=Review\+Company/);
    await new Promise(resolve => setTimeout(resolve, 250));
    await route.fulfill({ status: requests === 1 ? 503 : 200, contentType: 'application/json', body: JSON.stringify({ ok: requests > 1, message: requests === 1 ? 'Delivery unavailable. Please try again.' : 'Your introduction has been received.' }) });
  });
  await page.locator('button[type="submit"]').click();
  await page.waitForFunction(() => document.querySelector('[data-form-status]').dataset.state === 'error');
  assert.equal(await page.getByLabel('Company name').inputValue(), 'Review Company');
  assert.equal(await page.locator('button[type="submit"]').isEnabled(), true);
  await page.locator('button[type="submit"]').click();
  await page.waitForFunction(() => document.querySelector('[data-form-status]').dataset.state === 'success');
  assert.equal(await page.getByLabel('Company name').inputValue(), '');
  assert.equal(requests, 2);
  await page.unroute('**/api/inquiries');
});
