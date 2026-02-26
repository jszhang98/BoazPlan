import { test, expect } from '@playwright/test';

test('add member to church flow', async ({ page }) => {
  // First create a church via API directly
  const churchRes = await page.request.post('/api/v1/churches', {
    data: { name: 'E2E RBAC Church', slug: `e2e-rbac-${Date.now()}` },
  });
  const { data: church } = await churchRes.json();

  // Create a user via API directly
  const userRes = await page.request.post('/api/v1/users', {
    data: { email: `e2e-rbac-${Date.now()}@test.com`, displayName: 'E2E Member' },
  });
  const { data: user } = await userRes.json();

  // Navigate to the members page
  await page.goto(`/churches/${church.id}/members`);

  // Church name should be visible
  await expect(page.getByText('E2E RBAC Church')).toBeVisible();

  // Fill in the user ID and select pastor role
  await page.getByPlaceholder('User ID').fill(user.id);
  await page.selectOption('select', 'pastor');

  // Submit
  await page.getByRole('button', { name: /add member/i }).click();

  // Member should appear in the list
  await expect(page.getByText('E2E Member')).toBeVisible();
  await expect(page.getByText('Pastor')).toBeVisible();
});
