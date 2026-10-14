const LOGIN_URL = 'https://settings-comics.akriviahcm.io/';
 
export class LoginPage {
  constructor(page) {
    this.page = page;
    // All locators for the login screen live here, and only here
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }
 
  async goto() {
    await this.page.goto(LOGIN_URL);
  }
 
  async login(user, pass) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginButton.click();
  }
}