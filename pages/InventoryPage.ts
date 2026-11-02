import type { Page, Locator } from '@playwright/test';

/** Product-grid operations shared by all shopping-cart scenarios. */
export class InventoryPage {
  constructor(private readonly page: Page) {}

  get cartBadge(): Locator {
    return this.page.locator('[data-test="shopping-cart-badge"]');
  }

  addButton(productSlug: string): Locator {
    return this.page.locator(`[data-test="add-to-cart-${productSlug}"]`);
  }

  removeButton(productSlug: string): Locator {
    return this.page.locator(`[data-test="remove-${productSlug}"]`);
  }

  async addToCart(productSlug: string): Promise<void> {
    await this.addButton(productSlug).click();
  }

  async removeFromCart(productSlug: string): Promise<void> {
    await this.removeButton(productSlug).click();
  }

  async openCart(): Promise<void> {
    await this.page.locator('[data-test="shopping-cart-link"]').click();
  }
}
