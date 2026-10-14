export class LeaveManagementPage {
  constructor(page) {
    this.page = page;
    this.holidaysCreation = page.getByRole('button', { name: 'Holidays Creation' });
    
  }
 
  async openHolidaysCreation() {
    await this.holidaysCreation.click();
  }
}
 