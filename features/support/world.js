import 'dotenv/config';
import { chromium } from '@playwright/test';
import { setWorldConstructor, Before, After, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { LoginPage } from '../../pages/LoginPage.js';
import { HomePage } from '../../pages/HomePage.js';
import { LeaveManagementPage } from '../../pages/LeaveManagementPage.js';

// Fail fast with a clear message if config is missing
for (const key of ['ADMIN_USER', 'ADMIN_PASS']) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable ${key}. Check your .env file or CI secrets.`);
  }
}

setDefaultTimeout(60 * 1000);

class CustomWorld {
  constructor({ attach, log, parameters }) {
    this.attach = attach;
    this.log = log;
    this.parameters = parameters;
  }

  async init() {
    this.browser = await chromium.launch({ headless: !!process.env.CI });
    this.context = await this.browser.newContext();
    await this.context.tracing.start({ screenshots: true, snapshots: true });
    this.page = await this.context.newPage();
    this.loginPage = new LoginPage(this.page);
    this.homePage = new HomePage(this.page);
    this.leavePage = new LeaveManagementPage(this.page);
  }

  async close() {
    await this.browser?.close();
  }
}
setWorldConstructor(CustomWorld);

Before(async function () {
  await this.init();
});

After(async function (scenario) {
  const failed = scenario.result?.status === Status.FAILED;

  if (failed && this.page) {
    try {
      const png = await this.page.screenshot();
      this.attach(png, 'image/png');
    } catch { /* page may already be closed */ }
  }

  if (this.context) {
    try {
      if (failed) {
        const safe = scenario.pickle.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
        await this.context.tracing.stop({ path: `test-results/trace-${safe}.zip` });
      } else {
        await this.context.tracing.stop();
      }
    } catch { /* ignore tracing errors */ }
  }

  await this.close();
});