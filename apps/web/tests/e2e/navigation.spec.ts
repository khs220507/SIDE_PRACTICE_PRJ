import { expect, test } from '@playwright/test';

test('operator can navigate from dashboard to device detail', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page.getByRole('heading', { name: 'Operational Dashboard' })).toBeVisible();
  await page.getByRole('link', { name: /Devices/i }).click();
  await page.getByRole('link', { name: 'Boiler Room Sensor' }).click();

  await expect(page.getByRole('heading', { name: 'Boiler Room Sensor' })).toBeVisible();
  await expect(page.getByText('STM32F407', { exact: true })).toBeVisible();
});
