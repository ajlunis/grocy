const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Go to the root to trigger database migration
    await page.goto('http://localhost:8000/');
    await page.waitForLoadState('networkidle');
    console.log('Successfully navigated to the root URL.');

    // Now go to the products page
    await page.goto('http://localhost:8000/products');
    await page.waitForLoadState('networkidle');
    console.log('Successfully navigated to the products page.');

    // Wait for the table to be visible
    await page.waitForSelector('.table');
    console.log('Products table is visible.');

    // Take a screenshot
    await page.screenshot({ path: 'verification_screenshot.png' });
    console.log('Screenshot taken successfully.');

  } catch (error) {
    console.error('An error occurred during the Playwright test:', error);
    await page.screenshot({ path: 'error_screenshot.png' });
  } finally {
    await browser.close();
  }
})();
