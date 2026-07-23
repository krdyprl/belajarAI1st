import { test, expect } from '@playwright/test'

test.describe('Scanner Page', () => {
  test('redirect ke login saat belum auth', async ({ page }) => {
    await page.goto('/scanner')
    await expect(page).toHaveURL(/\/login/)
  })

  test('halaman login untuk scan memiliki title yang benar', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible()
  })

  test('tombol masuk memiliki styling yang benar', async ({ page }) => {
    await page.goto('/login')
    const btn = page.getByRole('button', { name: 'Masuk' })
    await expect(btn).toBeVisible()
    await expect(btn).toHaveClass(/font-semibold/)
  })

  test('label form menggunakan font-semibold', async ({ page }) => {
    await page.goto('/login')
    const labels = page.locator('label')
    const count = await labels.count()
    for (let i = 0; i < count; i++) {
      await expect(labels.nth(i)).toHaveClass(/font-semibold/)
    }
  })

  test('input email memiliki height minimal 44px', async ({ page }) => {
    await page.goto('/login')
    const input = page.locator('input[type="email"]')
    const box = await input.boundingBox()
    if (box) expect(box.height).toBeGreaterThanOrEqual(44)
  })

  test('form login memiliki 2 input fields', async ({ page }) => {
    await page.goto('/login')
    const inputs = page.locator('input')
    const count = await inputs.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })
})
