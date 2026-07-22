import { test, expect } from '@playwright/test'

test.describe('Scanner Features', () => {
  test('login page has email input', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('login button has minimum height for accessibility', async ({ page }) => {
    await page.goto('/login')
    const btn = page.getByRole('button', { name: 'Masuk' })
    const box = await btn.boundingBox()
    expect(box).not.toBeNull()
    if (box) expect(box.height).toBeGreaterThanOrEqual(48)
  })

  test('form labels use semibold font', async ({ page }) => {
    await page.goto('/login')
    const labels = page.locator('label')
    const count = await labels.count()
    for (let i = 0; i < count; i++) {
      await expect(labels.nth(i)).toHaveClass(/font-semibold/)
    }
  })

  test('email input has proper styling', async ({ page }) => {
    await page.goto('/login')
    const input = page.locator('input[type="email"]')
    const box = await input.boundingBox()
    expect(box).not.toBeNull()
    if (box) expect(box.height).toBeGreaterThanOrEqual(44)
  })

  test('login page has AI Medication Assistant branding', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('AI Medication Assistant')).toBeVisible()
  })
})
