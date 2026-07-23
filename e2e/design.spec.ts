import { test, expect } from '@playwright/test'

test.describe('Design System - Glassmorphism', () => {
  test('halaman login memiliki gradient background', async ({ page }) => {
    await page.goto('/login')
    const bg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundImage)
    expect(bg).toContain('gradient')
  })

  test('card login menggunakan glass-strong', async ({ page }) => {
    await page.goto('/login')
    const card = page.locator('.glass-strong').first()
    await expect(card).toBeVisible()
  })

  test('icon gradient primary di login', async ({ page }) => {
    await page.goto('/login')
    const icon = page.locator('.gradient-primary').first()
    await expect(icon).toBeVisible()
  })

  test('rounded-2xl diterapkan di card', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('.rounded-2xl').first()).toBeVisible()
  })
})

test.describe('Design System - Accessibility', () => {
  test('font body diatas 16px', async ({ page }) => {
    await page.goto('/login')
    const size = await page.evaluate(() => window.getComputedStyle(document.body).fontSize)
    expect(parseFloat(size)).toBeGreaterThanOrEqual(16)
  })

  test('tombol submit memiliki min-height 48px', async ({ page }) => {
    await page.goto('/login')
    const btn = page.getByRole('button', { name: 'Masuk' })
    const box = await btn.boundingBox()
    if (box) expect(box.height).toBeGreaterThanOrEqual(48)
  })

  test('heading menggunakan font-bold', async ({ page }) => {
    await page.goto('/login')
    const headings = page.locator('h1')
    const count = await headings.count()
    for (let i = 0; i < count; i++) {
      await expect(headings.nth(i)).toHaveClass(/font-bold/)
    }
  })

  test('tombol menggunakan rounded-xl', async ({ page }) => {
    await page.goto('/login')
    const btn = page.getByRole('button', { name: 'Masuk' })
    await expect(btn).toHaveClass(/rounded-xl/)
  })

  test('input border tebal minimal 1px', async ({ page }) => {
    await page.goto('/login')
    const input = page.locator('input[type="email"]')
    const bw = await input.evaluate((el) => parseFloat(window.getComputedStyle(el).borderTopWidth))
    expect(bw).toBeGreaterThanOrEqual(1)
  })
})
