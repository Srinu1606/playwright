export class LeaveManagementPage {
  constructor(page) {
    this.page = page;
    this.holidaysCreation = page.getByRole('button', { name: 'Holidays Creation' });
    this.addNew = page.getByRole('button', { name: 'Add New' });
    this.holidayName = page.getByPlaceholder('Enter Name');
    //this.holidayDate = page.getByPlaceholder('Holiday Date');
    this.holidayDate = page.locator('#date');
    this.datePickerContainer = page.locator('.p-datepicker');
    this.prevMonthBtn = this.datePickerContainer.locator('.p-datepicker-prev');
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
    // Target only the visible Confirm button. 
    // We add :visible to ignore all the hidden confirmation modals in the DOM.
    this.confirmButton = page.locator('#request-cancel:visible').filter({ hasText: 'Confirm' });

  }

  async openHolidaysCreation(day, targetMonth, targetYear, type) {
    await this.holidaysCreation.click();
    await this.addNew.click();
    await this.holidayName.fill('New Year');
    await this.holidayDate.click();
    await this.datePickerContainer.waitFor({ state: 'visible' });

    let currentMonth = (await this.currentMonthLabel.innerText()).trim();
    let currentYear = (await this.currentYearLabel.innerText()).trim();

    // Navigate backwards until we reach the target month and year
    while (currentMonth !== targetMonth || currentYear !== targetYear) {
      await this.prevMonthBtn.click();
      await this.page.waitForTimeout(300); // Wait for UI to update

      currentMonth = (await this.currentMonthLabel.innerText()).trim();
      currentYear = (await this.currentYearLabel.innerText()).trim();

      // Safety break to prevent infinite loop
      if (parseInt(currentYear) < 2020) {
        throw new Error(`Could not find the target date: ${targetMonth} ${targetYear}`);
      }
    }

    // Locate the specific day
    const dayLocator = this.datePickerContainer
      .locator('.p-datepicker-calendar td:not(.p-datepicker-other-month)')
      .getByText(day, { exact: true });

    // Check if the date is disabled (older than 90 days)
    const classAttribute = await dayLocator.getAttribute('class');
    if (classAttribute && classAttribute.includes('p-disabled')) {
      throw new Error(`The date ${targetMonth} ${day}, ${targetYear} is disabled (more than 90 days old).`);
    }

    await dayLocator.click();
    await this.holidayTypeDropdown.click();

    // 2. Wait for the specific option to be visible and click it
    // We use getByText to match the exact text in the <a> tags
    await this.holidayTypeOptions
      .getByText(type, { exact: true })
      .click();
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
    // 1. Open the dropdown
    await this.shiftDropdownToggle.click();

    // 2. Wait for the menu to be visible
    await this.shiftDropdownMenu.waitFor({ state: 'visible' });

    // 3. Loop through the array of shift names
    for (const shiftName of shiftNames) {
      // Type the shift name into the search box to filter the huge list
      await this.shiftSearchInput.fill(shiftName);

      // Wait for the filter to apply (Angular requires a brief moment to filter the list)
      await this.page.waitForTimeout(500);

      // Locate the specific item by its text
      // We use .first() because your HTML shows duplicate shift names (e.g., "shift" appears multiple times)
      const shiftOption = this.page.locator('app-common-multi-select-dropdown .dropdown-item')
        .filter({ hasText: shiftName })
        .first();

      // Click the label instead of the checkbox. 
      // In custom UI components, the actual <input type="checkbox"> is often hidden, 
      // so clicking the <label> is the most reliable way to trigger the selection.
      await shiftOption.locator('label').click();

      // Clear the search box for the next iteration
      await this.shiftSearchInput.clear();
    }

    // 4. Close the dropdown by clicking the toggle again (or pressing Escape)
    await this.shiftDropdownToggle.click();
  }

  /**
   * Selects ALL available shifts using the "Select All" checkbox.
   */
  async selectAllShifts() {
    await this.shiftDropdownToggle.click();
    await this.shiftDropdownMenu.waitFor({ state: 'visible' });

    // Click the "Select All" label
    await this.selectAllCheckbox.click();

    await this.shiftDropdownToggle.click(); // Close dropdown
  }
  async setHolidayRepeat(shouldRepeat, numberOfTimes = '1') {
    // 1. Check the current state of the hidden checkbox input
    const isCurrentlyChecked = await this.repeatYesInput.isChecked();

    // 2. Only click the label if the current state doesn't match what we want
    if (shouldRepeat && !isCurrentlyChecked) {
      await this.repeatYesLabel.click(); // Click the visible label instead of the hidden input
    } else if (!shouldRepeat && isCurrentlyChecked) {
      await this.repeatYesLabel.click();
    }

    // 3. If we want it checked, wait for the number input to appear and fill it
    if (shouldRepeat) {
      await this.repeatNumberInput.waitFor({ state: 'visible' });
      await this.repeatNumberInput.fill(numberOfTimes);
    }
  }
  async submitAndConfirm() {
    // 1. Click Submit
    await this.submitButton.click();

    // 2. Wait for the Confirm button to appear
    await this.confirmButton.waitFor({ state: 'visible' });

    // 3. Click Confirm
    await this.confirmButton.click();
  }
}
