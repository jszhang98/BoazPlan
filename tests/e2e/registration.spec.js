import { test, expect } from '@playwright/test';

test('user registration flow', async ({ page }) => {
  await page.goto('/register');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[placeholder="Display Name (optional)"]', 'Tester');
  await page.click('button:has-text("Register")');

  await expect(page.locator('text=Registration successful')).toBeVisible();
});
