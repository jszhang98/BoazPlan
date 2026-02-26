import { test, expect } from '@playwright/test';

test('user can create a new request and see it listed', async ({ page }) => {
  // Navigate to home page
  await page.goto('/');

  // Fill in form
  await page.fill('input[placeholder="Title"]', 'Playwright Test');
  await page.fill('textarea[placeholder="Description"]', 'Testing new request flow');
  await Promise.all([
    page.waitForResponse((resp) => resp.url().includes('/api/v1/requests') && resp.status() === 201),
    page.click('button:has-text("Post request")')
  ]);

  // After submission, the new request should appear in the recent list
  await page.waitForSelector('ul > li');
  await expect(page.locator('ul > li').first()).toHaveText(/Playwright Test/);
});
