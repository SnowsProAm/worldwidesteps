// Run with Playwright CLI on an already-open local preview or deployed site:
// playwright-cli run-code "$(cat scripts/check-startup.playwright.js)"
async (page) => {
  const origin = new URL(page.url()).origin;
  const browser = page.context().browser();
  const results = [];
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const scenario = async (name, options, run) => {
    const context = await browser.newContext(options);
    const tab = await context.newPage();
    const errors = [];
    tab.on('pageerror', error => errors.push(error.message));
    try {
      await run(tab, context);
      check(errors.length === 0, `${name}: ${errors.join('; ')}`);
      results.push(`${name}: passed`);
    } finally { await context.close(); }
  };
  const navigate = (tab, path = '/') => tab.goto(origin + path, { waitUntil: 'domcontentloaded' });
  const dashboard = tab => tab.locator('#world-title').waitFor({ timeout: 10000 });

  await scenario('stalled history does not block the homepage', {}, async tab => {
    await tab.route('**/rest/v1/step_update_log?*', () => {});
    await navigate(tab);
    await dashboard(tab);
    check(await tab.getByRole('table', { name: 'Worldwide athlete rankings' }).isVisible(), 'Leaderboard missing');
    await tab.locator('.data-notice').waitFor({ timeout: 15000 });
    check(await tab.locator('.world-loading').count() === 0, 'Spinner returned after timeout');
  });

  await scenario('stalled core request times out and recovers without reload', {}, async tab => {
    let block = true;
    await tab.route('**/rest/v1/profiles?*', route => { if (!block) return route.continue(); });
    await navigate(tab);
    await tab.getByRole('alert').waitFor({ timeout: 16000 });
    check(await tab.getByRole('button', { name: 'Try again', exact: true }).isVisible(), 'Retry missing');
    block = false;
    await dashboard(tab); // The 15-second refresh recovers without user action.
    check(await tab.locator('.load-error').count() === 0, 'Error remained after recovery');
    check(await tab.evaluate(() => performance.getEntriesByType('navigation').length) === 1, 'Unexpected reload');
  });

  await scenario('mobile first visit works with storage blocked', { viewport: { width: 390, height: 844 }, isMobile: true, reducedMotion: 'reduce' }, async (tab, context) => {
    await context.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
      Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
    });
    await navigate(tab);
    await dashboard(tab);
    check(await tab.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile horizontal overflow');
    await tab.screenshot({ path: 'output/playwright/startup-mobile-fixed.png' });
  });

  await scenario('visible schools page loads without window focus', {}, async (tab, context) => {
    await context.addInitScript(() => { document.hasFocus = () => false; });
    const response = tab.waitForResponse(response => response.url().includes('/rpc/get_public_school_step_challenge') && response.ok(), { timeout: 10000 });
    await navigate(tab, '/schools');
    await response;
    await tab.locator('#sc-title').waitFor({ timeout: 10000 });
    check(await tab.locator('.world-loading').count() === 0, 'School spinner remained');
  });
  return results;
}
