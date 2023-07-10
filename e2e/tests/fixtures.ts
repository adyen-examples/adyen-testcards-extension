/**
 * Defines base test: set the context loading the extension, retrieve extension id
 */
import { test as base, expect as playwrightTest, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

const PATH_TO_EXTENSION = '../../'

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({ }, use) => {
    const pathToExtension = path.join(__dirname, PATH_TO_EXTENSION);
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--headless=new`,
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
      permissions: ["clipboard-read", "clipboard-write"],
    });
    await use(context);
    await context.close();
  },
   extensionId: async ({ context }, use) => {

    // for manifest v3:
    let [background] = context.serviceWorkers();
    if (!background)
      background = await context.waitForEvent('serviceworker');

    const extensionId = background.url().split('/')[2];
    await use(extensionId);

    },
});

export const expect = test.expect;