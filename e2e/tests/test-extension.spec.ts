import { test, expect } from './fixtures';

// verify filter
test('filter', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/panel.html`);

  await expect(page.locator('text="Filter:"')).toBeVisible();

  await page.locator('input[id="search"]').type("Mastercard");
  // Mastercard visible
  await expect(page.locator('text="2222 4000 7000 0005"')).toBeVisible();
  // Maestro not visible
  await expect(page.locator('text="6771 7980 2100 0008"')).not.toBeVisible();

});

// verify copy card number to clipboard
test('copy', async ({ page, extensionId }) => {

    await page.goto(`chrome-extension://${extensionId}/panel.html`);
  
    const firstRow = await page.$('tr');
    if(firstRow == null) {
        throw new Error("firstRow not found");
    }

    const copyLink = await firstRow.$(`a.copyLinkClick`);
    if(copyLink == null) {
        throw new Error("copyLink not found");
    }

    await copyLink.click(); 

    // clipboard includes first card number
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe("3700 0000 0000 002");
  
});

