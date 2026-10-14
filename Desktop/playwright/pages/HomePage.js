export class HomePage {
  constructor(page) {
    this.page = page;
  }
 
  // Dynamic locator: one method works for any module title on the page
  moduleTitle(name) {
    return this.page.locator('.ah-title', { hasText: name });
  }
 
  async openModule(name) {
    await this.moduleTitle(name).click();
  }
}
 