export interface EnvironmentConfig {
  // Screenshot configurations
  screenshotOnSuccess: boolean;

  // Report configurations
  reportsDir: string;
  screenshotsDir: string;

  // Browser configurations
  browser: {
    name: "chromium" | "firefox" | "webkit";
    headless: boolean;
    baseUrl: string;
  };
}
