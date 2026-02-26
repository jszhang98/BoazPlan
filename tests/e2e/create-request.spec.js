import { test, expect } from '@playwright/test';

test.describe('Story 2.1 — Create Prayer Request', () => {
  test('creates a request with urgency and visibility fields', async ({ page }) => {
    await page.goto('/');

    // Fill out the new-request form
    await page.fill('#req-title', 'Need meals delivered this week');
    await page.fill('#req-desc', 'My wife just had surgery and we have three young kids.');

    // Select "high" urgency
    await page.click('button:has-text("High")');

    // Select "group" visibility card
    await page.click('label:has-text("Group only")');

    // Submit
    await page.click('button[type="submit"]:has-text("Post request")');

    // Success banner should appear
    await expect(page.locator('text=Request posted successfully!')).toBeVisible({ timeout: 5000 });
  });

  test('shows "offline – draft saved" banner when offline', async ({ page, context }) => {
    await page.goto('/');

    // Fill title so draft is non-empty
    await page.fill('#req-title', 'Test offline draft');

    // Go offline
    await context.setOffline(true);

    // Submit while offline
    await page.click('button[type="submit"]:has-text("Save draft (offline)"), button[type="submit"]');

    // Offline badge and queued banner should appear
    await expect(page.locator('text=Offline — draft saved')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Draft saved')).toBeVisible({ timeout: 3000 });

    // Come back online
    await context.setOffline(false);
  });

  test('restores draft on page reload', async ({ page }) => {
    await page.goto('/');
    await page.fill('#req-title', 'Persisted draft title');
    await page.fill('#req-desc', 'Persisted description');

    // Reload — draft should be restored from localStorage
    await page.reload();
    await expect(page.locator('#req-title')).toHaveValue('Persisted draft title');
    await expect(page.locator('#req-desc')).toHaveValue('Persisted description');

    // Discard draft
    await page.click('button:has-text("Discard")');
    await expect(page.locator('#req-title')).toHaveValue('');
  });
});
