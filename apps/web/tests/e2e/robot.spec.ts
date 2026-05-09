import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function canvasHasNonBackgroundPixels(page: Page) {
  return page.locator('[data-testid="robot-canvas"]').evaluate((canvasElement) => {
    const canvas = canvasElement as HTMLCanvasElement;
    const context = canvas.getContext('webgl2');

    if (!context || canvas.width === 0 || canvas.height === 0) {
      return false;
    }

    const width = canvas.width;
    const height = canvas.height;
    const image = new Uint8Array(width * height * 4);
    context.readPixels(0, 0, width, height, context.RGBA, context.UNSIGNED_BYTE, image);
    let changedPixels = 0;

    for (let index = 0; index < image.length; index += 64) {
      const red = image[index];
      const green = image[index + 1];
      const blue = image[index + 2];
      const isBackground = red > 238 && green > 242 && blue > 240;

      if (!isBackground) {
        changedPixels += 1;
      }
    }

    return changedPixels > 100;
  });
}

test.describe('robot renderer', () => {
  test('renders a nonblank robot canvas on desktop and mobile', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 820 });
    await page.goto('/robot');

    await expect(page.getByRole('heading', { name: 'Robot Digital Twin' })).toBeVisible();
    await expect(page.locator('[data-testid="robot-canvas"]')).toBeVisible();
    await expect(page.locator('[data-testid="robot-canvas"]')).toHaveAttribute('data-geometry-loaded', 'true');
    await expect.poll(() => canvasHasNonBackgroundPixels(page)).toBe(true);

    await page.setViewportSize({ width: 390, height: 760 });
    await expect(page.locator('[data-testid="robot-canvas"]')).toBeVisible();
    await expect.poll(() => canvasHasNonBackgroundPixels(page)).toBe(true);
  });
});
