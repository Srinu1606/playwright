import { expect } from '@playwright/test';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'];

// The disabled class may sit on the day element or on its parent <td>
async function isDisabled(dayLocator) {
  return dayLocator.evaluate(el =>
    el.classList.contains('p-disabled') ||
    !!el.closest('td')?.classList.contains('p-disabled') ||
    !!el.closest('[aria-disabled="true"]')
  );
}

export class LeaveManagementPage {
  constructor(page) {
    this.page = page;
    this.holidaysCreation = page.getByRole('button', { name: 'Holidays Creation' });
    this.addNew = page.getByRole('button', { name: 'Add New' });
    this.holidayName = page.getByPlaceholder('Enter Name');
    this.holidayDate = page.locator('#date');
    this.datePickerContainer = page.locator('.p-datepicker');
    this.prevMonthBtn = this.datePickerContainer.locator('.p-datepicker-prev');
    this.nextMonthBtn = this.datePickerContainer.locator('.p-datepicker-next');
    this.currentMonthLabel = this.datePickerContainer.locator('.p-datepicker-month');
    this.currentYearLabel = this.datePickerContainer.locator('.p-datepicker-year');
    this.holidayTypeDropdown = page.locator('.ah-dropdown-placeholder');
    this.holidayTypeOptions = page.locator('.dropdown-item');
    this.shiftRadio = page.getByLabel('Shift', { exact: true });
    this.eligibilityRadio = page.getByLabel('Eligibility Engine', { exact: true });
    this.shiftDropdownToggle = page.locator('app-common-multi-select-dropdown .ah-dropdown-toggle');
    this.shiftDropdownMenu = page.locator('app-common-multi-select-dropdown .dropdown-menu');
    this.shiftSearchInput = page.locator('app-common-multi-select-dropdown input[placeholder="Search"]');
    this.selectAllCheckbox = page.locator('app-common-multi-select-dropdown label:has-text("Select All")');
    this.repeatYesInput = page.locator('#repeatYes');
    this.repeatYesLabel = page.locator('label[for="repeatYes"]');
    this.repeatNumberInput = page.getByPlaceholder('Enter value');
    this.submitButton = page.locator('#request-submit');
    // :visible ignores the hidden confirmation modals that are always in the DOM
    this.confirmButton = page.locator('#request-cancel:visible').filter({ hasText: 'Confirm' });
  }

  // Opens the form and fills the name
  async startHoliday(name) {
    await this.holidaysCreation.click();
    await this.addNew.click();
    await this.holidayName.fill(name);
  }

  // Opens the picker, navigates (forward or backward) to the month of `date`,
  // and returns the locator of the day cell. Does not click it.
  async pickDate(date) {
    await this.holidayDate.click();
    await this.datePickerContainer.waitFor({ state: 'visible' });

    const target = date.getFullYear() * 12 + date.getMonth();
    let reached = false;

    for (let i = 0; i < 48; i++) {
      const monthText = (await this.currentMonthLabel.innerText()).trim();
      const month = MONTHS.indexOf(monthText);
      if (month === -1) throw new Error(`Unexpected month label in date picker: "${monthText}"`);
      const year = parseInt((await this.currentYearLabel.innerText()).trim(), 10);

      const diff = target - (year * 12 + month);
      if (diff === 0) { reached = true; break; }

      await (diff < 0 ? this.prevMonthBtn : this.nextMonthBtn).click();
      // Real wait instead of a fixed sleep: the month label must change
      await expect(this.currentMonthLabel).not.toHaveText(monthText);
    }

    if (!reached) throw new Error(`Could not navigate the date picker to ${date.toDateString()}`);

    return this.datePickerContainer
      .locator('.p-datepicker-calendar td:not(.p-datepicker-other-month)')
      .getByText(String(date.getDate()), { exact: true });
  }

  async isDateDisabled(date) {
    const day = await this.pickDate(date);
    return isDisabled(day);
  }

  async selectDate(date) {
    const day = await this.pickDate(date);
    if (await isDisabled(day)) {
      throw new Error(`The date ${date.toDateString()} is disabled in the date picker.`);
    }
    await day.click();
  }

  async selectType(type) {
    await this.holidayTypeDropdown.click();
    await this.holidayTypeOptions.getByText(type, { exact: true }).click();
  }

  // Convenience wrapper: name + date + type
  async openHolidaysCreation(date, type, name) {
    await this.startHoliday(name);
    await this.selectDate(date);
    await this.selectType(type);
  }

  async selectFunctionalLink(type) {
    if (type === 'Shift') {
      await this.shiftRadio.check();
    } else if (type === 'Eligibility Engine') {
      await this.eligibilityRadio.check();
    } else {
      throw new Error(`Invalid option: ${type}. Please use 'Shift' or 'Eligibility Engine'.`);
    }
  }

  async selectShifts(shiftNames) {
    await this.shiftDropdownToggle.click();
    await this.shiftDropdownMenu.waitFor({ state: 'visible' });

    for (const shiftName of shiftNames) {
      await this.shiftSearchInput.fill(shiftName);

      const shiftOption = this.page
        .locator('app-common-multi-select-dropdown .dropdown-item')
        .filter({ hasText: shiftName })
        .first();

      // Wait for the filtered option instead of a fixed sleep
      await shiftOption.waitFor({ state: 'visible' });
      await shiftOption.locator('label').click();
      await this.shiftSearchInput.clear();
    }

    await this.shiftDropdownToggle.click();
  }

  async selectAllShifts() {
    await this.shiftDropdownToggle.click();
    await this.shiftDropdownMenu.waitFor({ state: 'visible' });
    await this.selectAllCheckbox.click();
    await this.shiftDropdownToggle.click();
  }

  async setHolidayRepeat(shouldRepeat, numberOfTimes = '1') {
    const isCurrentlyChecked = await this.repeatYesInput.isChecked();
    if (shouldRepeat !== isCurrentlyChecked) {
      await this.repeatYesLabel.click();
    }
    if (shouldRepeat) {
      await this.repeatNumberInput.waitFor({ state: 'visible' });
      await this.repeatNumberInput.fill(numberOfTimes);
    }
  }

  async submitAndConfirm() {
    await this.submitButton.click();
    await this.confirmButton.waitFor({ state: 'visible' });
    await this.confirmButton.click();
  }
}