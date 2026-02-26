import { test, expect } from '@playwright/test';

test.describe('Story 2.2 — Request Feed & History', () => {
  test.beforeAll(async ({ request }) => {
    // Seed a couple of requests via API
    await request.post('/api/v1/requests', {
      data: { title: 'Need help with groceries', urgency: 'high',   visibility: 'public'  },
    });
    await request.post('/api/v1/requests', {
      data: { title: 'Prayer for healing',       urgency: 'urgent', visibility: 'group'   },
    });
    await request.post('/api/v1/requests', {
      data: { title: 'Help with transport',       urgency: 'normal', visibility: 'private' },
    });
  });

  test('Feed page shows requests and badges', async ({ page }) => {
    await page.goto('/requests');

    await expect(page.locator('h1:has-text("Request Feed")')).toBeVisible();

    // At least one request card should be visible
    await expect(page.locator('a[href^="/requests/"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Filter by urgency=urgent shows only urgent requests', async ({ page }) => {
    await page.goto('/requests');

    // Select urgent from urgency dropdown
    await page.selectOption('select:near(:text("All urgencies"))', 'urgent');

    // All visible cards should have "urgent" text
    const cards = page.locator('a[href^="/requests/"]');
    await expect(cards.first()).toBeVisible({ timeout: 5000 });

    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toContainText('urgent');
    }
  });

  test('Status tab "Resolved" shows empty state when no resolved requests', async ({ page }) => {
    await page.goto('/requests');
    await page.click('button:text("Resolved")');
    await expect(page.locator('text=No requests match these filters')).toBeVisible({ timeout: 5000 });
  });

  test('Clicking a request card navigates to detail page', async ({ page }) => {
    await page.goto('/requests');

    const firstCard = page.locator('a[href^="/requests/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 5000 });
    const title = await firstCard.locator('p.font-semibold').textContent();

    await firstCard.click();

    await expect(page).toHaveURL(/\/requests\/[a-f0-9-]+/);
    await expect(page.locator('h1')).toContainText(title.trim());
  });

  test('Request detail page shows status controls', async ({ page }) => {
    await page.goto('/requests');

    const firstCard = page.locator('a[href^="/requests/"]').first();
    await firstCard.click();

    // Status section
    await expect(page.locator('h2:has-text("Update Status")')).toBeVisible();
    await expect(page.locator('button:has-text("Resolved")')).toBeVisible();
  });

  test('Updating status on detail page persists', async ({ page }) => {
    // Create a fresh request to update
    const res = await page.request.post('/api/v1/requests', {
      data: { title: 'Status update test request' },
    });
    const { data } = await res.json();

    await page.goto(`/requests/${data.id}`);

    // Click "Assigned"
    await page.click('button:has-text("Assigned")');
    await expect(page.locator('text=Status updated to "Assigned"')).toBeVisible({ timeout: 5000 });

    // Reload and confirm status persisted
    await page.reload();
    const badge = page.locator('span:has-text("assigned"), span:has-text("Assigned")').first();
    await expect(badge).toBeVisible();
  });
});
