import { test, expect } from './fixtures';

// verify filter
test('filter', async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/panel.html`);

    // use filter
    await expect(page.locator('text="Filter:"')).toBeVisible();
    await page.locator('input').pressSequentially('Mastercard', { delay: 100 });

    // Mastercard visible
    await expect(page.locator('text="2222 4000 7000 0005"')).toBeVisible();
    // Maestro not visible
    await expect(page.locator('text="6771 7980 2100 0008"')).not.toBeVisible();
    // IBAN not visible
    await expect(page.locator('text="NL36TEST0236169114"')).not.toBeVisible();
});

// verify favourites message
test('fav', async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/panel.html`);

    await expect(page.locator('text="Add favourites if you like :-)"')).toBeVisible();
});

// verify copy card to clipboard
test('copy card details', async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/panel.html`);

    // card number
    let cardnumber = page.locator('text="4871 0499 9999 9910"');
    await expect(cardnumber).toBeVisible();
    await cardnumber.click();

    let clipboard = await page.evaluate("navigator.clipboard.readText()");
    expect(clipboard).toContain("4871 0499 9999 9910");

    // cvc
    let cvc = page.locator('text="7373"').first();
    await expect(cvc).toBeVisible();
    await cvc.click();

    clipboard = await page.evaluate("navigator.clipboard.readText()");
    expect(clipboard).toContain("7373");
});

// verify copy IBAN to clipboard
test('copy IBAN details', async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/panel.html`);

    // IBAN
    let iban = page.locator('text="IT60X0542811101000000123456"');
    await expect(iban).toBeVisible();
    await iban.click();

    let clipboard = await page.evaluate("navigator.clipboard.readText()");
    expect(clipboard).toContain("IT60X0542811101000000123456");

    // name
    let name = page.locator('text="A. Pacini"');
    await expect(name).toBeVisible();
    await name.click();

    clipboard = await page.evaluate("navigator.clipboard.readText()");
    expect(clipboard).toContain("A. Pacini");

});

// verify copy Giftcard to clipboard
test('copy Giftcard details', async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/panel.html`);

    // card number
    let cardnumber = page.locator('text="6036280000000000000"');
    await expect(cardnumber).toBeVisible();
    await cardnumber.click();

    let clipboard = await page.evaluate("navigator.clipboard.readText()");
    expect(clipboard).toContain("6036280000000000000");

    // code
    let code = page.locator('text="100"').first();
    await expect(code).toBeVisible();
    await code.click();

    clipboard = await page.evaluate("navigator.clipboard.readText()");
    expect(clipboard).toContain("100");

});

// verify make favourite
test('make favourite', async ({ page, extensionId }) => {

    await page.goto(`chrome-extension://${extensionId}/panel.html`);
    // empty favs message is visible
    await expect(page.locator('text="Add favourites if you like :-)"')).toBeVisible();

    // pin card in favs
    await page.click("[id='4871_0499_9999_9910']");
    await page.waitForTimeout(1000);

    // empty favs message is hidden
    await expect(page.locator('text="Add favourites if you like :-)"')).not.toBeVisible();

    // unpin card from favs
    await page.click("[id='4871_0499_9999_9910']");
    await page.waitForTimeout(1000);

    // empty favs message is visible
    await expect(page.locator('text="Add favourites if you like :-)"')).toBeVisible();
});
