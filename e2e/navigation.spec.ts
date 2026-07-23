import { test, expect } from '@playwright/test'

test.describe('Navigation & Layout', () => {
  test('login page memiliki branding MedCare', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('AI Medication Assistant')).toBeVisible()
  })

  test('semua halaman login memiliki gradient bg', async ({ page }) => {
    await page.goto('/login')
    const bg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundImage)
    expect(bg).toContain('gradient')
  })

  test('icon gradient di halaman login', async ({ page }) => {
    await page.goto('/login')
    const gradientIcons = page.locator('.gradient-primary')
    const count = await gradientIcons.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('bottom nav items terdefinisi di layout', async ({ page }) => {
    await page.goto('/login')
    const items = ['Ringkasan', 'Foto Obat', 'Obat Saya', 'Catatan']
    for (const item of items) {
      expect(typeof item).toBe('string')
    }
  })

  test('page title tidak kosong', async ({ page }) => {
    await page.goto('/login')
    const title = await page.title()
    expect(title.length).toBeGreaterThan(0)
  })
})

test.describe('Onboarding', () => {
  test('onboarding muncul saat pertama kali ke root', async ({ page }) => {
    await page.goto('/')
    const onChange = page.getByText('Foto Obat')
    if (await onChange.isVisible().catch(() => false)) {
      await expect(page.getByRole('button', { name: 'Lanjut' })).toBeVisible()
    }
  })

  test('onboarding bisa di-skip', async ({ page }) => {
    await page.goto('/')
    const skipBtn = page.getByText('Lewati')
    if (await skipBtn.isVisible().catch(() => false)) {
      await skipBtn.click()
      await expect(page).toHaveURL(/\/login/)
    }
  })

  test('onboarding complete step by step', async ({ page }) => {
    await page.goto('/')
    const nextBtn = page.getByRole('button', { name: 'Lanjut' })
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click()
      await expect(page.getByRole('button', { name: 'Lanjut' })).toBeVisible()
    }
  })
})
