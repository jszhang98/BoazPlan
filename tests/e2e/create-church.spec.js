import { test, expect } from '@playwright/test';

test('create church flow', async ({ page }) => {
  await page.goto('/churches/new');

  // Fill in church name — slug should auto-populate
  await page.getByLabel(/church name/i).fill('Playwright Church');
  await expect(page.getByLabel(/church handle/i)).toHaveValue('playwright-church');

  // Override location
  await page.getByLabel(/location/i).fill('Test City');

  // Select strict privacy mode
  await page.getByText('Strict').click();

  // Submit
  await page.getByRole('button', { name: /create church/i }).click();

  // Success state
  await expect(page.getByText(/church created/i)).toBeVisible();
  await expect(page.getByText('playwright-church')).toBeVisible();
});
