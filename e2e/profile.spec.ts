import { test, expect } from '@playwright/test'

test.describe('Profile Page', () => {
  test('redirect ke login saat belum auth', async ({ page }) => {
    await page.goto('/profile')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Consultation Page', () => {
  test('redirect ke login saat belum auth', async ({ page }) => {
    await page.goto('/consultation')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Journal Page', () => {
  test('redirect ke login saat belum auth', async ({ page }) => {
    await page.goto('/journal')
    await expect(page).toHaveURL(/\/login/)
  })
})
