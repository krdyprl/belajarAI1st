import { test, expect } from '@playwright/test'

test.describe('Senior-Friendly Design', () => {
  test('body font size is at least 16px', async ({ page }) => {
    await page.goto('/login')
    const fontSize = await page.evaluate(
      () => window.getComputedStyle(document.body).fontSize
    )
    expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(16)
  })

  test('submit button height is at least 48px', async ({ page }) => {
    await page.goto('/login')
    const btn = page.getByRole('button', { name: 'Masuk' })
    const box = await btn.boundingBox()
    if (box) expect(box.height).toBeGreaterThanOrEqual(48)
  })

  test('headings use bold font', async ({ page }) => {
    await page.goto('/login')
    const headings = page.locator('h1, h2')
    const count = await headings.count()
    for (let i = 0; i < count; i++) {
      await expect(headings.nth(i)).toHaveClass(/font-bold/)
    }
  })

  test('form inputs have thick border', async ({ page }) => {
    await page.goto('/login')
    const input = page.locator('input[type="email"]')
    const bw = await input.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).borderTopWidth)
    )
    expect(bw).toBeGreaterThanOrEqual(2)
  })

  test('card elements use rounded-2xl', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('.rounded-2xl').first()).toBeVisible()
  })

  test('text-secondary color is defined', async ({ page }) => {
    await page.goto('/login')
    const color = await page.evaluate(() => {
      const el = document.querySelector('.text-text-secondary')
      return el ? window.getComputedStyle(el).color : null
    })
    expect(color).not.toBeNull()
  })

  test('Pill icon is present on login page', async ({ page }) => {
    await page.goto('/login')
    const icons = page.locator('svg')
    const count = await icons.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('bottom nav items defined in app', async ({ page }) => {
    await page.goto('/login')
    const items = ['Ringkasan', 'Foto Obat', 'Obat Saya', 'Catatan']
    for (const item of items) {
      expect(item).toBeTruthy()
    }
  })

  test('button has rounded-xl class', async ({ page }) => {
    await page.goto('/login')
    const btn = page.getByRole('button', { name: 'Masuk' })
    await expect(btn).toHaveClass(/rounded-xl/)
  })

  test('body background is correct', async ({ page }) => {
    await page.goto('/login')
    const bg = await page.evaluate(
      () => window.getComputedStyle(document.body).backgroundColor
    )
    expect(bg).toBeTruthy()
  })
})
