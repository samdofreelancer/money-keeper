import { Before, After, AfterStep, Status } from "@cucumber/cucumber";

Before(async function () {
  console.log("Before scenario: Launching browser");
  await this.launchBrowser();
});

After(async function () {
  console.log("After scenario: Closing browser");
  await this.closeBrowser();
});

AfterStep(async function ({ result }) {
  if (result.status === Status.FAILED) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const screenshotPath = `reports/screenshots/failed-step-${timestamp}.png`;
    const screenshot = await this.page.screenshot({ path: screenshotPath });
    this.attach(screenshot, "image/png");
  }
  // Removed screenshot on success to improve performance
});
