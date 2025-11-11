const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:8000/stockoverview');
    await page.waitForLoadState('networkidle');
    console.log('Successfully navigated to the stock overview page.');

    await page.screenshot({ path: 'stock_overview.png' });
    console.log('Screenshot of stock overview page taken successfully.');

  } catch (error) {
    console.error('An error occurred during the Playwright test:', error);
    await page.screenshot({ path: 'error_screenshot.png' });
  } finally {
    await browser.close();
  }
})();
