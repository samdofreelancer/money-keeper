/**
 * Test Constants for Account Creation Scenarios
 * Centralized configuration for timeouts, defaults, and test data
 */

// ===== Timeouts =====
export const TIMEOUTS = {
  /** Dialog visibility/closing timeout */
  DIALOG: 5000,
  /** Table rendering and account visibility timeout */
  TABLE_WAIT: 10000,
  /** Default Playwright timeout for expects */
  DEFAULT: 5000,
} as const;

// ===== Delays =====
export const DELAYS = {
  /** Allow time for state updates to propagate */
  STATE_UPDATE: 500,
} as const;

// ===== Test Data Defaults =====
export const TEST_DEFAULTS = {
  /** Default account balance for tests */
  BALANCE: 100_000,
  /** Default currency for tests */
  CURRENCY: 'USD',
  /** Default account type */
  ACCOUNT_TYPE: 'E_WALLET',
  /** Default form input validation amounts */
  INVALID_BALANCE: -500_000,
  /** Default XSS payload for security testing */
  XSS_PAYLOAD: `<script>alert('xss')</script>`,
  /** Extra length for oversized name tests */
  OVERSIZED_NAME_LENGTH: 200,
} as const;

// ===== API Routes =====
export const API_ROUTES = {
  /** Account creation/listing endpoint */
  ACCOUNTS: '**/api/accounts',
} as const;
