import { test, expect } from '@playwright/test';

test.describe('Story 2.3 — Anonymity & Privacy', () => {
  test('anonymous toggle is visible on new request form', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Post anonymously')).toBeVisible();
  });

  test('toggling anonymous changes switch state', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('button[role="switch"]');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    // Toggle back
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  test('anonymous request shows "Anonymous" in feed instead of author name', async ({ page, request }) => {
    // Create a user and an anonymous request via API
    const userRes = await request.post('/api/v1/users', {
      data: { email: `feed-anon-${Date.now()}@test.com`, displayName: 'Jane Secret' },
    });
    const { data: user } = await userRes.json();

    await request.post('/api/v1/requests', {
      data: {
        title: `Anonymous request ${Date.now()}`,
        anonymous: true,
        authorId: user.id,
      },
    });

    await page.goto('/requests');

    // Feed should show "Anonymous" label and NOT "Jane Secret"
    const feed = page.locator('ul');
    await expect(feed).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Anonymous').first()).toBeVisible();
    expect(await page.locator('text=Jane Secret').count()).toBe(0);
  });

  test('detail page shows "Anonymous" for anonymous request', async ({ page, request }) => {
    const res = await request.post('/api/v1/requests', {
      data: { title: `Detail anon ${Date.now()}`, anonymous: true },
    });
    const { data } = await res.json();

    await page.goto(`/requests/${data.id}`);

    await expect(page.locator('dd:has-text("Anonymous")')).toBeVisible({ timeout: 5000 });
  });

  test('strict-church request shows "Awaiting pastor approval" on detail page', async ({ page, request }) => {
    // Create strict church
    const churchRes = await request.post('/api/v1/churches', {
      data: { name: `Strict E2E ${Date.now()}`, privacyMode: 'strict' },
    });
    const { data: church } = await churchRes.json();

    // Post a request to that church
    const reqRes = await request.post('/api/v1/requests', {
      data: { title: 'Needs approval E2E', churchId: church.id },
    });
    const { data: req } = await reqRes.json();

    expect(req.status).toBe('pending_approval');

    await page.goto(`/requests/${req.id}`);
    await expect(page.locator('text=Awaiting pastor approval')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Approve")')).toBeVisible();
  });

  test('approving a pending request changes its status', async ({ page, request }) => {
    const churchRes = await request.post('/api/v1/churches', {
      data: { name: `Strict Approve ${Date.now()}`, privacyMode: 'strict' },
    });
    const { data: church } = await churchRes.json();

    const reqRes = await request.post('/api/v1/requests', {
      data: { title: 'Approve me E2E', churchId: church.id },
    });
    const { data: req } = await reqRes.json();

    await page.goto(`/requests/${req.id}`);

    await page.click('button:has-text("Approve")');
    await expect(page.locator('text=Status updated to "Open"')).toBeVisible({ timeout: 5000 });

    // Approval panel should now be gone
    await expect(page.locator('text=Awaiting pastor approval')).not.toBeVisible();
  });
});
