// Run with Playwright CLI against the production homepage after reviewing it:
// playwright-cli run-code "$(cat scripts/render-social-preview.playwright.js)"
// Run from this repository. Change the dated image URL in HTML when refreshing it.
async (page) => {
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto('https://worldwidesteps.com/');
  await page.locator('.globe-canvas canvas').waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll('.world-brand img')].map(img => img.decode()));
    // Live totals keep changing. The sharing image uses the real hero without
    // baking a leaderboard number into a long-lived social preview.
    const address=document.createElement('p');
    address.className='social-preview-address';
    address.textContent='worldwidesteps.com';
    document.querySelector('.hero-content').append(address);
  });
  await page.addStyleTag({content:`
    html,body { width:1200px; height:630px; margin:0; overflow:hidden; }
    *,*::before,*::after { animation:none!important; transition:none!important; }
    .world-page { min-height:630px!important; background:#fff!important; }
    .world-header { height:84px; padding:20px 48px!important; border:0!important; }
    .world-header nav,.data-notice,.world-total,.hero-actions,.world-summary,.globe-caption { display:none!important; }
    .main-pad { padding:0 48px!important; }
    .world-hero { height:546px; margin:0; }
    .hero-grid { height:100%; grid-template-columns:1.35fr 1fr; gap:20px; transform:translateY(-25px); }
    .hero-content h1 { font-size:57px; line-height:1.15; }
    .hero-intro { font-size:17px; max-width:550px; margin-top:25px; }
    .hero-slogan { font-size:23px; }
    .world-globe { width:470px; max-width:470px; margin-left:-20px; }
    .social-preview-address { margin-top:36px; color:#0c69c8; font-weight:700; font-size:16px; }
  `});
  await page.screenshot({path:'public/images/worldwide-steps-social-20261105.png',animations:'disabled',scale:'css'});
}
