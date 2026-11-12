// Run through Playwright CLI on an open local or production World Wide Steps page.
async (page) => {
  const origin = new URL(page.url()).origin;
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const historyUrl = '**/rest/v1/rpc/get_public_fitness_season_history';
  const titleButton = tab => tab.getByRole('button', { name: /6 Global season titles\. View past seasons for/ }).first();
  const openerName = tab => tab.getByRole('button', { name: 'View past seasons for Kate Flynn', exact: true });
  const emptyText = 'No completed global season results yet.';
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin + '/#leaderboard');
  await page.reload();
  await titleButton(page).waitFor({ timeout: 20000 });
  await page.locator('#leaderboard').screenshot({ path: 'output/playwright/season-titles-desktop.png' });
  await titleButton(page).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('table', { name: 'Global season results' }).waitFor();
  check((await dialog.locator('.athlete-history-totals').innerText()).replace(/\s+/g, ' ').includes('6 Global'), 'Global title total missing');
  await dialog.getByRole('button', { name: 'National', exact: true }).click();
  await dialog.getByRole('table', { name: 'National season results' }).waitFor();
  await dialog.getByRole('button', { name: 'Regional', exact: true }).click();
  await dialog.getByRole('table', { name: 'Regional season results' }).waitFor();
  await dialog.getByRole('button', { name: 'Global', exact: true }).click();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    check(await dialog.evaluate(el => el.contains(document.activeElement)), 'Keyboard focus escaped the dialog');
  }
  await dialog.screenshot({ path: 'output/playwright/season-history-desktop.png' });
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  check(await titleButton(page).evaluate(el => el === document.activeElement), 'Focus did not return to the athlete button');

  let releaseLoading;
  await page.route(historyUrl, async route => { await new Promise(resolve => { releaseLoading = resolve; }); await route.fulfill({ json: [] }); });
  await openerName(page).click();
  await page.getByRole('status').filter({ hasText: 'Loading past seasons' }).waitFor();
  while (!releaseLoading) await page.waitForTimeout(20);
  releaseLoading();
  await page.getByText(emptyText, { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Close season history' }).click();
  await page.unroute(historyUrl);

  let fail = true;
  await page.route(historyUrl, route => route.fulfill({ status: fail ? 503 : 200, json: fail ? { message: 'Test unavailable' } : [] }));
  await openerName(page).click();
  await page.getByRole('alert').filter({ hasText: 'couldn’t load' }).waitFor();
  fail = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await page.getByText(emptyText, { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Close season history' }).click();
  await page.unroute(historyUrl);

  const context = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const mobile = await context.newPage();
  mobile.on('pageerror', error => errors.push(error.message));
  try {
    await mobile.goto(origin + '/#leaderboard');
    await titleButton(mobile).waitFor({ timeout: 20000 });
    check(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile page overflows horizontally');
    await mobile.locator('#leaderboard').screenshot({ path: 'output/playwright/season-titles-mobile.png' });
    await titleButton(mobile).tap();
    const mobileDialog = mobile.getByRole('dialog');
    await mobileDialog.getByRole('table', { name: 'Global season results' }).waitFor();
    const bounds = await mobileDialog.boundingBox();
    check(bounds.x >= 0 && bounds.x + bounds.width <= 391 && bounds.height <= 844, 'Mobile dialog is clipped');
    await mobileDialog.screenshot({ path: 'output/playwright/season-history-mobile.png' });
    await mobile.getByRole('button', { name: 'Close season history' }).tap();
    await mobile.getByRole('button', { name: 'Switch to night mode' }).tap();
    await titleButton(mobile).tap();
    await mobile.getByRole('table', { name: 'Global season results' }).waitFor();
    check(await mobile.locator('.athlete-history-first').first().evaluate(el => getComputedStyle(el).color === 'rgb(232, 199, 126)'), 'Dark-mode title colour is too dim');
    await mobile.getByRole('dialog').screenshot({ path: 'output/playwright/season-history-mobile-dark.png' });
  } finally { await context.close(); }
  check(errors.length === 0, errors.join('; '));
  return { passed: ['live anonymous title/history reads', 'Global/National/Regional history', 'keyboard focus trap and restoration', 'Escape close', 'loading state', 'empty state', 'error and retry', 'mobile tap and layout', 'dark mode'], pageErrors: errors };
}
