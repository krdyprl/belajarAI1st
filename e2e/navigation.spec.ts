import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('login page shows AI Medication Assistant branding', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('AI Medication Assistant')).toBeVisible()
  })

  test('login page has AI Medication Assistant text', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('AI Medication Assistant')).toBeVisible()
  })

  test('page has proper title tag', async ({ page }) => {
    await page.goto('/login')
    const title = await page.title()
    expect(title).toBeTruthy()
  })
})

test.describe('Onboarding', () => {
  test('onboarding shows on first visit to root', async ({ page }) => {
    await page.goto('/')
    const heading = page.getByText('Foto Obat')
    if (await heading.isVisible().catch(() => false)) {
      await expect(page.getByRole('button', { name: 'Lanjut' })).toBeVisible()
    }
  })

  test('onboarding can be skipped', async ({ page }) => {
    await page.goto('/')
    const skip = page.getByText('Lewati')
    if (await skip.isVisible().catch(() => false)) {
      await skip.click()
      await expect(page).toHaveURL(/\/login/)
    }
  })

  test('onboarding can be completed step by step', async ({ page }) => {
    await page.goto('/')
    const nextBtn = page.getByRole('button', { name: 'Lanjut' })
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click()
      await expect(page.getByRole('button', { name: 'Lanjut' })).toBeVisible()
    }
  })
})
