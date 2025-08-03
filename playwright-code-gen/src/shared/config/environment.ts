/**
 * Environment configuration for tests
 * This file centralizes all environment-specific settings
 */

export class Environment {
  // Browser configuration
  private static _headless: boolean = process.env.HEADLESS === 'true';
  private static _slowMo: number = parseInt(process.env.SLOW_MO || '0', 10);
  private static _timeout: number = parseInt(
    process.env.TIMEOUT || '30000',
    10
  );

  // Application configuration
  private static _baseUrl: string =
    process.env.BASE_URL || 'http://localhost:5173';

  // Test configuration
  private static _retries: number = parseInt(process.env.RETRIES || '0', 10);
  private static _workers: number = parseInt(process.env.WORKERS || '1', 10);
  private static _reporter: string = process.env.REPORTER || 'list';

  // Getters for browser configuration
  public static get headless(): boolean {
    return Environment._headless;
  }

  public static get slowMo(): number {
    return Environment._slowMo;
  }

  public static get timeout(): number {
    return Environment._timeout;
  }

  // Getters for application configuration
  public static get baseUrl(): string {
    return Environment._baseUrl;
  }

  // Getters for test configuration
  public static get retries(): number {
    return Environment._retries;
  }

  public static get workers(): number {
    return Environment._workers;
  }

  public static get reporter(): string {
    return Environment._reporter;
  }
}
