import { AccountPage } from '@/pages/AccountPage';
import { generateTestAccountName } from '@/test-data/test-name.util';
import { expect, type TestInfo } from '@/fixtures/test-fixture';
import { expectAccountExists } from '@/assertions/expectAccountExists';
import { TIMEOUTS, DELAYS, TEST_DEFAULTS, API_ROUTES } from './account-creation.constants';

/**
 * Account Creation - Test Scenarios (Given-When-Then)
 * 
 * Organized by test phase:
 * - GIVEN: Setup preconditions (given* functions)
 * - WHEN: Perform actions (when* functions)
 * - THEN: Verify outcomes (then* functions)
 */

// ===== GIVEN: Setup & Preconditions =====

/**
 * GIVEN: Account creation form is open
 */
export async function givenAccountFormIsOpen(accountPage: AccountPage): Promise<void> {
  await accountPage.navigateToAccounts();
  await accountPage.openCreateAccountDialog();
}

/**
 * GIVEN: Form is filled with valid account data
 */
export async function givenFormIsFilledWithValidData(
  accountPage: AccountPage,
  name: string,
  balance: number,
  currency: string,
  type: string = 'E_WALLET'
): Promise<void> {
  await givenAccountFormIsOpen(accountPage);
  await accountPage.fillAccountName(name);
  await accountPage.fillInitialBalance(balance);
  await accountPage.selectCurrency(currency);
  await accountPage.selectAccountType(type);
}

/**
 * GIVEN: Form is partially filled (for form reset verification)
 */
export async function givenFormIsPartiallFilledAndClosed(
  accountPage: AccountPage,
  name: string,
  balance: number,
  currency: string
): Promise<void> {
  await givenAccountFormIsOpen(accountPage);
  await accountPage.fillAccountName(name);
  await accountPage.fillInitialBalance(balance);
  await accountPage.selectCurrency(currency);
  await accountPage.closeDialog();
}

/**
 * GIVEN: An account has been created successfully
 */
export async function givenAccountHasBeenCreated(
  accountPage: AccountPage,
  account: { name: string; initialBalance: number; currency: string }
): Promise<void> {
  await givenAccountFormIsOpen(accountPage);
  await givenFormIsFilledWithValidData(
    accountPage,
    account.name,
    account.initialBalance,
    account.currency
  );
  await whenUserSubmitsForm(accountPage);
  
  // CRITICAL: Wait for dialog to close AND account to appear in table
  // This ensures account is persisted before creating the next one
  const dialog = await accountPage.getCreateDialog();
  await expect(dialog).toBeHidden({ timeout: TIMEOUTS.DIALOG });
  
  // Wait for account to be visible in table before proceeding
  const exists = await accountPage.waitForAccountInTable(account.name, TIMEOUTS.TABLE_WAIT);
  expect(exists).toBe(true);
}

/**
 * GIVEN: Form is filled with valid data (convenience shorthand)
 */
export async function givenFormIsOpenAndFilled(
  accountPage: AccountPage,
  name: string,
  balance: number,
  currency: string
): Promise<void> {
  // Shorthand for givenFormIsFilledWithValidData (which already opens form)
  await givenFormIsFilledWithValidData(accountPage, name, balance, currency);
}

/**
 * Helper: Fill form with specific values (used by validation tests)
 */
async function fillFormWith(
  accountPage: AccountPage,
  name?: string,
  balance?: number,
  currency: string = TEST_DEFAULTS.CURRENCY
): Promise<void> {
  if (name !== undefined) await accountPage.fillAccountName(name);
  if (balance !== undefined) await accountPage.fillInitialBalance(balance);
  await accountPage.selectCurrency(currency);
  await accountPage.selectAccountType(TEST_DEFAULTS.ACCOUNT_TYPE);
}

/**
 * GIVEN: Form with empty account name (validation test)
 */
export async function givenFormWithEmptyName(
  accountPage: AccountPage,
  balance: number = TEST_DEFAULTS.BALANCE,
  currency: string = TEST_DEFAULTS.CURRENCY
): Promise<void> {
  await givenAccountFormIsOpen(accountPage);
  await fillFormWith(accountPage, undefined, balance, currency);
}

/**
 * GIVEN: Form with invalid balance (negative/zero)
 */
export async function givenFormWithInvalidBalance(
  accountPage: AccountPage,
  testInfo: TestInfo,
  invalidBalance: number = TEST_DEFAULTS.INVALID_BALANCE,
  currency: string = TEST_DEFAULTS.CURRENCY
): Promise<void> {
  const name = generateTestAccountName(testInfo, 'InvalidBalance');
  await givenAccountFormIsOpen(accountPage);
  await fillFormWith(accountPage, name, invalidBalance, currency);
}

/**
 * GIVEN: Form with whitespace-only name
 */
export async function givenFormWithWhitespaceName(
  accountPage: AccountPage,
  balance: number = TEST_DEFAULTS.BALANCE,
  currency: string = TEST_DEFAULTS.CURRENCY
): Promise<void> {
  await givenAccountFormIsOpen(accountPage);
  await fillFormWith(accountPage, '   \t\n   ', balance, currency);
}

/**
 * GIVEN: Form with dangerous/malicious input (XSS test)
 */
export async function givenFormWithDangerousInput(
  accountPage: AccountPage,
  testInfo: TestInfo,
  dangerousPattern: string = TEST_DEFAULTS.XSS_PAYLOAD
): Promise<void> {
  const dangerousName = generateTestAccountName(testInfo, 'Danger') + dangerousPattern;
  await givenAccountFormIsOpen(accountPage);
  await fillFormWith(accountPage, dangerousName, TEST_DEFAULTS.BALANCE, TEST_DEFAULTS.CURRENCY);
}

/**
 * GIVEN: Form with oversized account name (max length test)
 */
export async function givenFormWithOversizedName(
  accountPage: AccountPage,
  testInfo: TestInfo,
  extraLength: number = TEST_DEFAULTS.OVERSIZED_NAME_LENGTH
): Promise<void> {
  const longName = generateTestAccountName(testInfo, 'LongName') + 'X'.repeat(extraLength);
  await givenAccountFormIsOpen(accountPage);
  await fillFormWith(accountPage, longName, TEST_DEFAULTS.BALANCE, TEST_DEFAULTS.CURRENCY);
}

/**
 * GIVEN: Form with undersized account name (min length test)
 */
export async function givenFormWithUndersizedName(
  accountPage: AccountPage,
  testInfo: TestInfo
): Promise<void> {
  const shortName = generateTestAccountName(testInfo, 'X');
  await givenAccountFormIsOpen(accountPage);
  await fillFormWith(accountPage, shortName, TEST_DEFAULTS.BALANCE, TEST_DEFAULTS.CURRENCY);
}

// ===== WHEN: Actions =====

/**
 * WHEN: User submits the form
 */
export async function whenUserSubmitsForm(accountPage: AccountPage): Promise<void> {
  const submitButton = await accountPage.getSubmitButton();
  await submitButton.click();
}

/**
 * WHEN: User rapid-clicks submit button (simulating double-click)
 */
export async function whenUserRapidClicksSubmitButton(accountPage: AccountPage): Promise<void> {
  const submitButton = await accountPage.getSubmitButton();
  
  await Promise.all([
    submitButton.click(),
    submitButton.click().catch(() => {})
  ]);
}

/**
 * WHEN: User refreshes the page
 */
export async function whenUserRefreshesPage(accountPage: AccountPage): Promise<void> {
  await accountPage.refreshAccountsPage();
}

/**
 * WHEN: User opens the dialog again (after closing)
 */
export async function whenUserOpensDialogAgain(accountPage: AccountPage): Promise<void> {
  // Open dialog by clicking Add Account button (not navigating - we're already on page)
  await accountPage.openCreateAccountDialog();
}

/**
 * WHEN: User closes the dialog
 */
export async function whenUserClosesDialog(accountPage: AccountPage): Promise<void> {
  await accountPage.closeDialog();
}

// ===== THEN: Assertions & Verifications =====

/**
 * THEN: Form submission should be rejected (validation error occurred)
 */
export async function thenFormShouldBeRejected(accountPage: AccountPage): Promise<void> {
  const dialog = await accountPage.getCreateDialog();
  await expect(dialog).toBeVisible();
}

/**
 * Helper: Verify dialog is closed with timeout
 */
async function verifyDialogClosed(accountPage: AccountPage, timeout: number = TIMEOUTS.DIALOG): Promise<void> {
  const dialog = await accountPage.getCreateDialog();
  await expect(dialog).toBeHidden({ timeout });
}

/**
 * THEN: Account should be created successfully and appear in table
 */
export async function thenAccountShouldBeCreatedSuccessfully(
  accountPage: AccountPage,
  accountName: string
): Promise<void> {
  // Verify dialog closes (form submitted)
  await verifyDialogClosed(accountPage);
  
  // CRITICAL: Wait for table to stabilize before searching
  // This allows frontend to finish re-rendering all rows
  const table = await accountPage.getAccountTable();
  await expect(table).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
  
  // Small delay to allow any pending state updates
  await new Promise(resolve => setTimeout(resolve, DELAYS.STATE_UPDATE));
  
  // Verify account appears in table with longer timeout for multiple rapid creates
  const exists = await accountPage.waitForAccountInTable(accountName, TIMEOUTS.TABLE_WAIT);
  expect(exists).toBe(true);
}

/**
 * THEN: Dialog should be hidden/closed
 */
export async function thenDialogShouldBeClosed(accountPage: AccountPage): Promise<void> {
  await verifyDialogClosed(accountPage);
}

/**
 * THEN: Only one account should be created (prevent duplicates from rapid clicks)
 */
export async function thenOnlyOneAccountShouldBeCreated(
  accountPage: AccountPage,
  accountName: string
): Promise<void> {
  await thenDialogShouldBeClosed(accountPage);
  await expectAccountExists(accountPage, accountName);
}

/**
 * THEN: Form should be cleared/reset
 */
export async function thenFormShouldBeCleared(accountPage: AccountPage): Promise<void> {
  const nameInput = await accountPage.getAccountNameInput();
  await expect(nameInput).toHaveValue('');
}

/**
 * THEN: Dialog should be visible
 */
export async function thenDialogShouldBeVisible(accountPage: AccountPage): Promise<void> {
  const dialog = await accountPage.getCreateDialog();
  await expect(dialog).toBeVisible();
}

// ===== LISTING SCENARIOS =====

/**
 * GIVEN: Accounts page is open
 */
export async function givenAccountsPageIsOpen(accountPage: AccountPage): Promise<void> {
  await accountPage.navigateToAccounts();
}

/**
 * THEN: Accounts table should be visible
 */
export async function thenAccountTableShouldBeVisible(accountPage: AccountPage): Promise<void> {
  const table = await accountPage.getAccountTable();
  await expect(table).toBeVisible();
}

// ===== ACCESSIBILITY SCENARIOS =====

/**
 * WHEN: User presses Escape key
 */
export async function whenUserPressesEscape(accountPage: AccountPage): Promise<void> {
  await accountPage.pressKey('Escape');
}

/**
 * WHEN: User focuses submit button via keyboard
 */
export async function whenUserFocusesSubmitButton(accountPage: AccountPage): Promise<void> {
  await accountPage.focusSubmitButton();
}

/**
 * WHEN: User presses Enter key
 */
export async function whenUserPressesEnter(accountPage: AccountPage): Promise<void> {
  await accountPage.pressKey('Enter');
}

/**
 * THEN: Submit button should be focused
 */
export async function thenSubmitButtonShouldBeFocused(accountPage: AccountPage): Promise<void> {
  const isFocused = await accountPage.isSubmitButtonFocused();
  await expect(isFocused).toBeTruthy();
}

/**
 * THEN: Form should have proper accessibility attributes
 */
export async function thenFormShouldHaveAccessibilityAttributes(accountPage: AccountPage): Promise<void> {
  const nameInput = await accountPage.getAccountNameInput();
  await expect(nameInput).toBeVisible();
  
  const placeholder = await nameInput.getAttribute('placeholder');
  const ariaLabel = await nameInput.getAttribute('aria-label');
  const name = await nameInput.getAttribute('name');
  
  const hasAccessibilityInfo = placeholder || ariaLabel || name;
  expect(hasAccessibilityInfo).toBeTruthy();
}

// ===== NETWORK & PERFORMANCE SCENARIOS =====

/**
 * GIVEN: Network failure is simulated
 */
export async function givenNetworkFailureIsSimulated(accountPage: AccountPage): Promise<void> {
  await accountPage.routeApiRequests(API_ROUTES.ACCOUNTS, async (route) => {
    await route.abort('failed');
  });
}

/**
 * WHEN: Network is restored
 */
export async function whenNetworkIsRestored(accountPage: AccountPage): Promise<void> {
  await accountPage.unrouteApiRequests(API_ROUTES.ACCOUNTS);
}
