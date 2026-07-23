import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('redirect ke login saat belum auth', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page memiliki semua elemen', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible()
    await expect(page.getByPlaceholder('nama@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('Min. 6 karakter')).toBeVisible()
  })

  test('card login menggunakan glass design', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('.glass-strong').first()).toBeVisible()
  })

  test('card glass ada di halaman login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('.glass-strong').first()).toBeVisible()
  })

  test('judul halaman login benar', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible()
  })
})
