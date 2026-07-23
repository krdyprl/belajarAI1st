import { test, expect } from '@playwright/test'

test.describe('Auth - Login Page', () => {
  test('menampilkan semua elemen login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible()
    await expect(page.getByPlaceholder('nama@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('Min. 6 karakter')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible()
    await expect(page.getByText('AI Medication Assistant')).toBeVisible()
  })

  test('link ke register tersedia', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Daftar')).toBeVisible()
  })

  test('input form bisa di-focus', async ({ page }) => {
    await page.goto('/login')
    const input = page.getByPlaceholder('nama@email.com')
    await input.focus()
    await expect(input).toBeFocused()
  })

  test('redirect ke login saat akses halaman protected', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Auth - Register Page', () => {
  test('menampilkan semua elemen register', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: 'Daftar' })).toBeVisible()
    await expect(page.getByPlaceholder('Nama kamu')).toBeVisible()
    await expect(page.getByPlaceholder('nama@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('Min. 6 karakter')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Daftar' })).toBeVisible()
  })

  test('memiliki pilihan role dokter/keluarga/pasien', async ({ page }) => {
    await page.goto('/register')
    const select = page.locator('select')
    await expect(select).toBeVisible()
    const options = await select.locator('option').allTextContents()
    expect(options.some((o) => o.includes('Dokter'))).toBeTruthy()
    expect(options.some((o) => o.includes('Keluarga'))).toBeTruthy()
    expect(options.some((o) => o.includes('Pasien'))).toBeTruthy()
  })

  test('link ke login tersedia', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByText('Masuk')).toBeVisible()
  })

  test('semua halaman protected redirect ke login', async ({ page }) => {
    const pages = ['/', '/medication', '/scanner', '/journal', '/profile', '/consultation']
    for (const p of pages) {
      await page.goto(p)
      await expect(page).toHaveURL(/\/login/)
    }
  })
})
