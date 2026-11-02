import type { Page, Locator } from '@playwright/test';

/** Read-only cart state exposed through the SauceDemo cart UI. */
export class CartPage {
  constructor(private readonly page: Page) {}

  get items(): Locator {
    return this.page.locator('.cart_item');
  }

  itemNamed(productName: string): Locator {
    return this.page
      .locator('[data-test="inventory-item-name"]')
      .filter({ hasText: productName });
  }
}
