const DEFAULT_URL = 'https://settings-comics.akriviahcm.io/';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async goto() {
    // Read at call time so dotenv has already loaded
    await this.page.goto(process.env.BASE_URL || DEFAULT_URL);
  }

  async login(user, pass) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginButton.click();
  }
}