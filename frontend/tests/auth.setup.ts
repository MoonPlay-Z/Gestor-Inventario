import { test, expect } from '@playwright/test';

test.setTimeout(180000);

const USUARIO = 'bodegon1';
const CLAVE = 'admin123';

test('setup: login and save storage state', async ({ page }) => {
  await page.goto('/login');
  
  // Wait for page to load and form to be visible
  await page.waitForLoadState('networkidle');
  
  // Fill login form using placeholders as selectors
  await page.locator('input[placeholder="ej: admin o tu_usuario"]').first().fill(USUARIO);
  await page.locator('input[placeholder="••••••••"]').first().fill(CLAVE);
  
  // Click login button
  await page.locator('button[type="submit"]:has-text("Iniciar"), button:has-text("Iniciar Sesión"), button:has-text("Iniciar")').first().click();
  
  // Wait for navigation to dashboard
  await page.waitForURL(/.*dashboard|inicio/, { timeout: 60000 });
  
  // Wait a bit for page to stabilize
  await page.waitForTimeout(2000);
  
  // Verify we're logged in
  await expect(page.locator('text=/dashboard|inicio/i').first()).toBeVisible({ timeout: 10000 });
  
  // Save storage state
  await page.context().storageState({ path: 'storageState.json' });
});