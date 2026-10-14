import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeText: Locator;
  readonly ingresosMes: Locator;
  readonly facturasVencidas: Locator;
  readonly stockBajo: Locator;
  readonly facturasRecientes: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeText = page.locator('h1, h2').filter({ hasText: /dashboard|inicio|bienvenido/i }).first();
    this.ingresosMes = page.locator('[data-testid="ingresos-mes"], .metric-card:has-text("Ingresos")').first();
    this.facturasVencidas = page.locator('[data-testid="facturas-vencidas"], .metric-card:has-text("Vencidas")').first();
    this.stockBajo = page.locator('[data-testid="stock-bajo"], .metric-card:has-text("Stock")').first();
    this.facturasRecientes = page.locator('table tbody tr, .factura-item').first();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/.*dashboard|inicio/);
    await expect(this.welcomeText).toBeVisible({ timeout: 10000 });
  }
}