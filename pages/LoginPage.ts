import type { Page, Locator } from '@playwright/test';

/** Login form interactions and locators for the SauceDemo application. */
export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.username = page.locator('[data-test="username"]');
    this.password = page.locator('[data-test="password"]');
    this.submitButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async enterUsername(value: string): Promise<void> {
    await this.username.fill(value);
  }

  async enterPassword(value: string): Promise<void> {
    await this.password.fill(value);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async loginAs(username: string, password: string): Promise<void> {
    await this.open();
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.submit();
  }
}
