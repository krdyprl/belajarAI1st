import { test, expect } from '@playwright/test'

test.describe('Auth Flow', () => {
  test('login page has correct elements', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible()
    await expect(page.getByPlaceholder('nama@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('Min. 6 karakter')).toBeVisible()
  })

  test('register page has correct elements', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: 'Daftar' })).toBeVisible()
    await expect(page.getByPlaceholder('Nama kamu')).toBeVisible()
    await expect(page.getByPlaceholder('nama@email.com')).toBeVisible()
  })

  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible()
  })

  test('register link exists on login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Daftar').first()).toBeVisible()
  })

  test('login link exists on register page', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByText('Masuk').first()).toBeVisible()
  })

  test('form inputs are focusable', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.getByPlaceholder('nama@email.com')
    await emailInput.focus()
    await expect(emailInput).toBeFocused()
  })

  test('register has role selection', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('select')).toBeVisible()
  })
})
