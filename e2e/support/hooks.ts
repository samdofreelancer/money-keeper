import { Before, After, AfterStep, Status } from "@cucumber/cucumber";

Before(async function () {
  await this.launchBrowser();
});

After(async function () {
  await this.closeBrowser();
});

AfterStep(async function ({ result }) {
  if (result.status === Status.FAILED) {
    const screenshot = await this.page.screenshot({
      path: `reports/screenshots/${Date.now()}.png`,
    });
    this.attach(screenshot, "image/png");
  } else {
    const screenshot = await this.page.screenshot();
    this.attach(screenshot, "image/png");
  }
});
