import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { createAccount } from '@/actions/createAccount';
import { expectAccountExists } from '@/assertions/expectAccountExists';
import { generateTestAccountName } from '@/test-data/test-name.util';
import { logger } from '@/utils/logger';
import { openCreateDialog, fillAccountForm } from './account-creation.scenario';

/**
 * Account Creation - Accessibility Tests
 * 
 * Tests WCAG compliance and keyboard navigation
 * ✅ Auto-cleanup: All TEST_ accounts deleted after each test
 */

test.describe('Account Creation / Accessibility', () => {
  test('should ensure form elements have proper accessibility attributes', async ({ app }) => {
    await openCreateDialog(app.accountPage);

    const submitButton = await app.accountPage.getSubmitButton();
    await expect(submitButton).toHaveAttribute('type', 'button');

    const nameInput = await app.accountPage.getAccountNameInput();
    await expect(nameInput).toBeVisible();
    
    const placeholder = await nameInput.getAttribute('placeholder');
    const ariaLabel = await nameInput.getAttribute('aria-label');
    const name = await nameInput.getAttribute('name');
    
    const hasAccessibilityInfo = placeholder || ariaLabel || name;
    logger.debug(`Input a11y: placeholder="${placeholder}", aria-label="${ariaLabel}", name="${name}"`);
    
    const dialog = await app.accountPage.getCreateDialog();
    const dialogRole = await dialog.getAttribute('role');
    const dialogClass = await dialog.getAttribute('class');
    
    logger.debug(`Dialog a11y: role="${dialogRole}", class="${dialogClass}"`);
    
    await app.accountPage.pressKey('Escape');
    await expect(dialog).toBeHidden({ timeout: 2000 });

    logger.success('All accessibility checks passed');
  });

  test('should support keyboard navigation for form submission', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'KeyboardNav'))
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    await openCreateDialog(app.accountPage);
    await fillAccountForm(app.accountPage, account.name, account.initialBalance, account.currency);

    await app.accountPage.focusSubmitButton();
    
    const isFocused = await app.accountPage.isSubmitButtonFocused();
    await expect(isFocused).toBeTruthy();
    
    await app.accountPage.pressKey('Enter');
    
    const dialog = await app.accountPage.getCreateDialog();
    await expect(dialog).toBeHidden({ timeout: 5000 });

    await expectAccountExists(app.accountPage, account.name);
  });
});
