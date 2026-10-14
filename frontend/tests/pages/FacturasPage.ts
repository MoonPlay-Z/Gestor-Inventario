import { Page, Locator, expect } from '@playwright/test';

export class FacturasPage {
  readonly page: Page;
  readonly btnNuevaFactura: Locator;
  readonly clienteSelect: Locator;
  readonly productoSelect: Locator;
  readonly cantidadInput: Locator;
  readonly btnAgregarItem: Locator;
  readonly fechaVencimientoInput: Locator;
  readonly monedaSelect: Locator;
  readonly tasaCambioInput: Locator;
  readonly metodoPagoSelect: Locator;
  readonly btnEmitir: Locator;
  readonly modalFactura: Locator;
  readonly itemsTable: Locator;
  readonly totalDisplay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.btnNuevaFactura = page.locator('button:has-text("Nueva Factura"), button:has-text("Emitir")').first();
    this.clienteSelect = page.locator('select[name="clienteId"], select[id*="cliente"]').first();
    this.productoSelect = page.locator('select[name="productoId"], select[id*="producto"]').first();
    this.cantidadInput = page.locator('input[name="cantidad"], input[placeholder*="cantidad" i]').first();
    this.btnAgregarItem = page.locator('button:has-text("Agregar"), button:has-text("Añadir")').first();
    this.fechaVencimientoInput = page.locator('input[name="fechaVencimiento"], input[type="date"]').first();
    this.monedaSelect = page.locator('select[name="moneda"]').first();
    this.tasaCambioInput = page.locator('input[name="tasaCambio"]').first();
    this.metodoPagoSelect = page.locator('select[name="metodoPago"]').first();
    this.btnEmitir = page.locator('button[type="submit"]:has-text("Emitir"), button:has-text("Guardar Factura")').first();
    this.modalFactura = page.locator('.modal-overlay.open, [role="dialog"]').first();
    this.itemsTable = page.locator('table tbody tr, .item-row').first();
    this.totalDisplay = page.locator('text=/Total.*\\d+/').first();
  }

  async goto() {
    await this.page.goto('/ventas');
    await expect(this.page).toHaveURL(/.*ventas/, { timeout: 30000 });
    // Wait for page to be fully loaded
    await this.page.waitForLoadState('networkidle');
  }

  async nuevaFactura(data: {
    cliente: string;
    items: Array<{ producto: string; cantidad: string }>;
    fechaVencimiento: string;
    moneda?: string;
    tasaCambio?: string;
    metodoPago?: string;
  }) {
    await this.btnNuevaFactura.click();
    await expect(this.modalFactura).toBeVisible({ timeout: 5000 });

    await this.clienteSelect.selectOption({ label: data.cliente });
    await this.fechaVencimientoInput.fill(data.fechaVencimiento);

    if (data.moneda) await this.monedaSelect.selectOption(data.moneda);
    if (data.tasaCambio) await this.tasaCambioInput.fill(data.tasaCambio);

    for (const item of data.items) {
      await this.productoSelect.selectOption({ label: item.producto });
      await this.cantidadInput.fill(item.cantidad);
      await this.btnAgregarItem.click();
      await expect(this.itemsTable).toBeVisible({ timeout: 3000 });
    }

    if (data.metodoPago) {
      await this.metodoPagoSelect.selectOption(data.metodoPago);
    }

    await this.btnEmitir.click();
    await expect(this.modalFactura).toBeHidden({ timeout: 10000 });
  }
}