// @ts-check
import { test, expect } from '@playwright/test';

const LOGIN_URL = "https://settings-comics.akriviahcm.io/"


test('Valid Password', async ({ page }) => {
  await page.goto(LOGIN_URL);
  await page.getByPlaceholder('Username').fill('cadmin');
  await page.getByPlaceholder('Password').fill('Master@1234');
  await page.getByRole("button", {name:'Login'}).click();
  await page.locator('.ah-title', { hasText: 'Leave Management' }).click()
  await page.getByRole("button", {name:'Holidays Creation'}).click();
  // await expect(page).toHaveURL('/viewLeaveList/')
  // // await expect(page.getByRole("heading", {name:'Dashboard'})).toBeVisible()
});
