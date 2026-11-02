import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

type PageFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  browserDiagnostics: void;
};

/** Isolated per-test POM fixtures and failure-only browser diagnostics. */
export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  inventoryPage: async ({ page }, use) => { await use(new InventoryPage(page)); },
  cartPage: async ({ page }, use) => { await use(new CartPage(page)); },
  browserDiagnostics: [
    async ({ page }, use, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', err => errors.push(`Page error: ${err.message}`));
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(`Console error: ${msg.text()}`);
      });
      await use();
      if (errors.length && testInfo.status !== testInfo.expectedStatus) {
        await testInfo.attach('browser-diagnostics', {
          body: errors.slice(0, 30).join('\n').slice(0, 8000),
          contentType: 'text/plain',
        });
      }
    },
    { auto: true },
  ],
});
export { expect };
