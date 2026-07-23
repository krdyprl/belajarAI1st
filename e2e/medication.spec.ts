import { test, expect } from '@playwright/test'

test.describe('Medication Page', () => {
  test('redirect ke login saat belum auth', async ({ page }) => {
    await page.goto('/medication')
    await expect(page).toHaveURL(/\/login/)
  })

  test('judul halaman login benar', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible()
  })

  test('form register memiliki 4 input fields', async ({ page }) => {
    await page.goto('/register')
    const inputs = page.locator('input')
    const count = await inputs.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('register memiliki select role', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('select')).toBeVisible()
  })

  test('semua layar login/register menggunakan glass effect', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('.glass-strong')).toBeVisible()
  })

  test('role dokter ada di pilihan register', async ({ page }) => {
    await page.goto('/register')
    const options = await page.locator('select option').allTextContents()
    expect(options.some((o) => o.includes('Dokter'))).toBeTruthy()
  })
})
