import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// "today", "today+7", "today-100" -> JS Date
function parseDate(text) {
  const m = /^today([+-]\d+)?$/i.exec(text.trim());
  if (!m) throw new Error(`Unsupported date "${text}". Use today, today+N or today-N.`);
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + Number(m[1] ?? 0));
  return d;
}

// "New Year {unique}" -> "New Year lq3k9x2a". Same suffix is reused within one scenario.
function resolveName(world, name) {
  if (!name.includes('{unique}')) return name;
  world.uniqueNames ??= {};
  world.uniqueNames[name] ??= name.replace('{unique}', Date.now().toString(36));
  return world.uniqueNames[name];
}

Given('I am logged in as the admin', async function () {
  await this.loginPage.goto();
  await this.loginPage.login(process.env.ADMIN_USER, process.env.ADMIN_PASS);
});

When('I open the {string} module', async function (moduleName) {
  await this.homePage.openModule(moduleName);
});

When('I create a {string} holiday named {string} on {string}', async function (type, name, dateText) {
  await this.leavePage.openHolidaysCreation(parseDate(dateText), type, resolveName(this, name));
});

When('I start creating a holiday named {string}', async function (name) {
  await this.leavePage.startHoliday(resolveName(this, name));
});

When('I link the holiday to {string}', async function (option) {
  await this.leavePage.selectFunctionalLink(option);
});

When('I select the shifts {string}', async function (csv) {
  await this.leavePage.selectShifts(csv.split(',').map(s => s.trim()));
});

When('I select all shifts', async function () {
  await this.leavePage.selectAllShifts();
});

When('I set the holiday to repeat {int} times', async function (times) {
  await this.leavePage.setHolidayRepeat(true, String(times));
});

When('I submit and confirm', async function () {
  await this.leavePage.submitAndConfirm();
});

Then('the holiday {string} should be created', async function (name) {
  const finalName = resolveName(this, name);

  // After a successful save the Confirm popup closes.
  try {
    await expect(this.leavePage.confirmButton).toBeHidden({ timeout: 10000 });
  } catch {
    const messages = (await this.page
      .locator('.toast, .p-toast-message, [role="alert"], .alert, .error, .text-danger, .invalid-feedback')
      .allInnerTexts())
      .map(t => t.trim())
      .filter(Boolean);
    throw new Error(
      `Holiday "${finalName}" was NOT saved: confirmation popup is still open. ` +
      `Messages on screen: ${messages.length ? messages.join(' | ') : '(none found)'}`
    );
  }

  await expect(this.page.getByText(finalName).first()).toBeVisible({ timeout: 10000 });
});

Then('the date {string} should be disabled', async function (dateText) {
  const disabled = await this.leavePage.isDateDisabled(parseDate(dateText));
  expect(disabled, `Expected ${dateText} to be disabled in the date picker`).toBe(true);
});