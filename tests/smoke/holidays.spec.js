// @ts-check
import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { HomePage } from '../../pages/HomePage.js';
import { LeaveManagementPage } from '../../pages/LeaveManagementPage.js';

test('admin can create a repeating shift-based holiday', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const homePage = new HomePage(page);
  const leavePage = new LeaveManagementPage(page);

  const date = new Date();
  date.setDate(date.getDate() + 7);
  const name = `New Year ${Date.now().toString(36)}`;

  await loginPage.goto();
  await loginPage.login(process.env.ADMIN_USER, process.env.ADMIN_PASS);
  await homePage.openModule('Leave Management');
  await leavePage.openHolidaysCreation(date, 'General', name);
  await leavePage.selectFunctionalLink('Shift');
  await leavePage.selectShifts(['Week Off', 'Azure']);
  await leavePage.setHolidayRepeat(true, '5');
  await leavePage.submitAndConfirm();
});