// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { HomePage } from '../../pages/HomePage.js';
import { LeaveManagementPage } from '../../pages/LeaveManagementPage.js';
 
test('admin can open Holidays Creation', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const homePage = new HomePage(page);
  const leavePage = new LeaveManagementPage(page);
 
  await loginPage.goto();
  await loginPage.login("cadmin","Master@1234");
  await homePage.openModule('Leave Management');
  await leavePage.openHolidaysCreation('30', 'September', '2026','General');
  await leavePage.selectFunctionalLink('Shift');
  await leavePage.selectShifts(['Week Off', 'Azure']);
  await leavePage.setHolidayRepeat(true, '5');
  await leavePage.submitAndConfirm();
 
  // Add an assertion for what the Holidays Creation screen shows, for example:
  // await expect(page).toHaveURL(/holiday/i);
});
 