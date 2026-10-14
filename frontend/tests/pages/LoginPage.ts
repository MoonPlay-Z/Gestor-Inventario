import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly formError: Locator;

  constructor(page: Page) {
    this.page = page;
    // Selectores para el formulario de login
    this.usernameInput = page.locator('input[name="username"], input[type="text"][autocomplete="username"], input[placeholder*="usuario" i], input[id*="user" i]').first();
    this.passwordInput = page.locator('input[name="password"], input[type="password"], input[placeholder*="contraseña" i], input[id*="pass" i]').first();
    this.loginButton = page.locator('button[type="submit"]:has-text("Iniciar"), button[type="submit"]:has-text("Entrar"), button[type="submit"]:has-text("Login"), button:has-text("Iniciar sesión"), button:has-text("Iniciar")').first();
    this.errorMessage = page.locator('.toast.error, .alert-danger, [role="alert"], .error-message').first();
    this.formError = page.locator('.form-error, .error-message, [class*="error"]').first();
  }

  async goto() {
    await this.page.goto('/login');
    // If already logged in, we'll be redirected to dashboard
    try {
      await expect(this.page).toHaveURL(/.*login/, { timeout: 5000 });
    } catch {
      // Already redirected to dashboard, which is fine
      console.log('Already logged in, redirected to dashboard');
      return;
    }
    // Esperar a que el formulario esté visible
    await expect(this.usernameInput).toBeVisible({ timeout: 10000 });
    await expect(this.passwordInput).toBeVisible({ timeout: 5000 });
  }

  async login(username: string, password: string) {
    // Check if already logged in by trying to access dashboard
    const currentUrl = this.page.url();
    if (currentUrl.includes('/dashboard') || currentUrl.includes('/inicio')) {
      console.log('Already logged in, skipping login');
      return;
    }
    
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    
    // Click login button
    await this.loginButton.click();
    
    // Wait for navigation to dashboard
    await this.page.waitForURL(/.*dashboard|inicio/, { timeout: 60000 });
    
    // Wait a bit for page to stabilize
    await this.page.waitForTimeout(2000);
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}