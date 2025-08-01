import { TraceMode } from "../utils/validate-trace-mode";

export interface EnvironmentConfig {
  // Screenshot configurations
  screenshotOnSuccess: boolean;
  screenshotOnFailure: boolean;
  screenshotAllAfterStep?: boolean;

  // Report configurations
  reportsDir: string;
  screenshotsDir: string;

  // Timeout and retries
  timeout: number;
  retries: number;

  // Worker configurations
  workers: number | undefined;

  // Browser configurations
  browser: {
    name: "chromium" | "firefox" | "webkit";
    headless: boolean;
    baseUrl: string;
    actionTimeout: number;
    trace: TraceMode;
  };

  // Device configurations
  devices: {
    desktop: {
      name: string;
      viewport: { width: number; height: number };
      deviceScaleFactor: number;
      isMobile: boolean;
      hasTouch: boolean;
      defaultBrowserType: string;
    };
    mobile: {
      name: string;
      viewport: { width: number; height: number };
      deviceScaleFactor: number;
      isMobile: boolean;
      hasTouch: boolean;
      defaultBrowserType: string;
    };
  };
}
