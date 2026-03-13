import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Structured Logging Utility for E2E Tests with Winston
 * 
 * Features:
 * - Logs to both console (colored) and file (logs/e2e.log)
 * - Professional logging with emoji prefixes for visual clarity
 * - Supports multiple output formats: info, success, error, warning, debug, etc.
 * - Persistent log files for debugging and analysis
 * 
 * Log Files:
 * - logs/e2e.log: All logs (info, success, debug, warn, error)
 * - logs/error.log: Error logs only
 * 
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.info('Test started');
 *   logger.success('Account created');
 *   logger.error('Validation failed');
 *   logger.step(1, 'Navigate to home');
 *   logger.object('User data', { id: 1, name: 'John' });
 */

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create Winston logger instance
const winstonLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'e2e-tests' },
  transports: [
    // Console output with colors (no timestamp in console)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ message }: { message: unknown }) => String(message))
      ),
    }),
    // File output - errors only
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        })
      ),
    }),
    // File output - all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'e2e.log'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        })
      ),
    }),
  ],
});

export const logger = {
  /**
   * Log informational message
   * @param message The message to log
   */
  info(message: string): void {
    const text = `📝 ${message}`;
    winstonLogger.info(text);
  },

  /**
   * Log success message
   * @param message The message to log
   */
  success(message: string): void {
    const text = `✅ ${message}`;
    winstonLogger.info(text);
  },

  /**
   * Log warning message
   * @param message The message to log
   */
  warn(message: string): void {
    const text = `⚠️ ${message}`;
    winstonLogger.warn(text);
  },

  /**
   * Log error message
   * @param message The message to log
   */
  error(message: string): void {
    const text = `❌ ${message}`;
    winstonLogger.error(text);
  },

  /**
   * Log debug message with optional data
   * @param message The message to log
   * @param data Optional data to log
   */
  debug(message: string, data?: unknown): void {
    const text = `🐛 ${message}`;
    if (data) {
      winstonLogger.debug(`${text} ${JSON.stringify(data)}`);
    } else {
      winstonLogger.debug(text);
    }
  },

  /**
   * Log test step with number
   * @param step Step number
   * @param message Step description
   */
  step(step: number, message: string): void {
    const text = `🔹 Step ${step}: ${message}`;
    winstonLogger.info(text);
  },

  /**
   * Log section header
   * @param title Section title
   */
  section(title: string): void {
    const separator = '='.repeat(60);
    winstonLogger.info(`\n${separator}`);
    winstonLogger.info(`📌 ${title}`);
    winstonLogger.info(`${separator}\n`);
  },

  /**
   * Log subsection header
   * @param title Subsection title
   */
  subsection(title: string): void {
    const text = `\n--- ${title} ---\n`;
    winstonLogger.info(text);
  },

  /**
   * Log object in formatted JSON
   * @param label Label for the object
   * @param data Object to log
   */
  object(label: string, data: unknown): void {
    const text = `📊 ${label}: ${JSON.stringify(data, null, 2)}`;
    winstonLogger.info(text);
  },

  /**
   * Log array
   * @param label Label for the array
   * @param items Array items to log
   */
  array(label: string, items: unknown[]): void {
    const text = `📋 ${label}: ${JSON.stringify(items)}`;
    winstonLogger.info(text);
  },

  /**
   * Start a timer for performance measurement
   * @param label Label for the timer
   * @returns Function to call when timer ends
   */
  startTimer(label: string): () => void {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      const text = `⏱️ ${label}: ${duration}ms`;
      winstonLogger.info(text);
    };
  },

  /**
   * Log assertion result
   * @param condition Assertion condition text
   * @param expected Expected value
   * @param actual Actual value
   */
  assert(condition: string, expected: unknown, actual: unknown): void {
    if (expected === actual) {
      const text = `✅ Assert: ${condition}\n   Expected: ${JSON.stringify(expected)}\n   Actual: ${JSON.stringify(actual)}`;
      winstonLogger.info(text);
    } else {
      const text = `❌ Assert Failed: ${condition}\n   Expected: ${JSON.stringify(expected)}\n   Actual: ${JSON.stringify(actual)}`;
      winstonLogger.error(text);
    }
  },
};
