/**
 * Logger utility for test framework
 * Provides consistent logging across the test framework
 */

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private static logLevel: LogLevel = LogLevel.INFO;
  private static readonly prefix = '[Test Framework]';

  /**
   * Set the log level
   * @param level The log level to set
   */
  public static setLogLevel(level: LogLevel): void {
    Logger.logLevel = level;
  }

  /**
   * Set the log level from environment variable
   */
  public static setLogLevelFromEnv(): void {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    if (envLevel) {
      switch (envLevel) {
        case 'DEBUG':
          Logger.logLevel = LogLevel.DEBUG;
          break;
        case 'INFO':
          Logger.logLevel = LogLevel.INFO;
          break;
        case 'WARN':
          Logger.logLevel = LogLevel.WARN;
          break;
        case 'ERROR':
          Logger.logLevel = LogLevel.ERROR;
          break;
      }
    }
  }

  /**
   * Log a debug message
   * @param message The message to log
   * @param args Additional arguments to log
   */
  public static debug(message: string, ...args: unknown[]): void {
    if (Logger.logLevel <= LogLevel.DEBUG) {
      console.debug(`${Logger.prefix} [DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log an info message
   * @param message The message to log
   * @param args Additional arguments to log
   */
  public static info(message: string, ...args: unknown[]): void {
    if (Logger.logLevel <= LogLevel.INFO) {
      console.info(`${Logger.prefix} [INFO] ${message}`, ...args);
    }
  }

  /**
   * Log a warning message
   * @param message The message to log
   * @param args Additional arguments to log
   */
  public static warn(message: string, ...args: unknown[]): void {
    if (Logger.logLevel <= LogLevel.WARN) {
      console.warn(`${Logger.prefix} [WARN] ${message}`, ...args);
    }
  }

  /**
   * Log an error message
   * @param message The message to log
   * @param args Additional arguments to log
   */
  public static error(message: string, ...args: unknown[]): void {
    if (Logger.logLevel <= LogLevel.ERROR) {
      console.error(`${Logger.prefix} [ERROR] ${message}`, ...args);
    }
  }

  /**
   * Log a step message (always shown regardless of log level)
   * @param message The message to log
   */
  public static step(message: string): void {
    console.log(`${Logger.prefix} [STEP] ${message}`);
  }

  /**
   * Log the start of a test
   * @param testName The name of the test
   */
  public static testStart(testName: string): void {
    console.log(`\n${Logger.prefix} [TEST START] ${testName}`);
  }

  /**
   * Log the end of a test
   * @param testName The name of the test
   * @param status The status of the test
   */
  public static testEnd(
    testName: string,
    status: 'PASSED' | 'FAILED' | 'SKIPPED'
  ): void {
    console.log(`${Logger.prefix} [TEST END] ${testName} - ${status}\n`);
  }
}

// Initialize log level from environment
Logger.setLogLevelFromEnv();
