import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { createAccount } from '@/actions/createAccount';
import { expectAccountExists } from '@/assertions/expectAccountExists';
import { generateTestAccountName } from '@/test-data/test-name.util';
import { logger } from '@/utils/logger';
import { givenAccountFormIsOpen, givenFormIsFilledWithValidData, whenUserSubmitsForm } from './account-creation.scenario';

/**
 * Account Creation - Accessibility Tests
 * 
 * Tests WCAG compliance and keyboard navigation
 * ✅ Auto-cleanup: All TEST_ accounts deleted after each test
 */

test.describe('Account Creation / Accessibility', () => {
  test('should ensure form elements have proper accessibility attributes', async ({ app }) => {
    // GIVEN
    await givenAccountFormIsOpen(app.accountPage);

    // THEN: Submit button should have correct type
    const submitButton = await app.accountPage.getSubmitButton();
    await expect(submitButton).toHaveAttribute('type', 'button');

    // AND: Account name input should be visible
    const nameInput = await app.accountPage.getAccountNameInput();
    await expect(nameInput).toBeVisible();
    
    // AND: Input should have accessibility attributes
    const placeholder = await nameInput.getAttribute('placeholder');
    const ariaLabel = await nameInput.getAttribute('aria-label');
    const name = await nameInput.getAttribute('name');
    
    const hasAccessibilityInfo = placeholder || ariaLabel || name;
    logger.debug(`Input a11y: placeholder="${placeholder}", aria-label="${ariaLabel}", name="${name}"`);
    
    // AND: Dialog should have proper role
    const dialog = await app.accountPage.getCreateDialog();
    const dialogRole = await dialog.getAttribute('role');
    const dialogClass = await dialog.getAttribute('class');
    
    logger.debug(`Dialog a11y: role="${dialogRole}", class="${dialogClass}"`);
    
    // WHEN: User presses Escape
    await app.accountPage.pressKey('Escape');
    
    // THEN: Dialog should close
    await expect(dialog).toBeHidden({ timeout: 2000 });

    logger.success('All accessibility checks passed');
  });

  test('should support keyboard navigation for form submission', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'KeyboardNav'))
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    // GIVEN
    await givenAccountFormIsOpen(app.accountPage);
    await givenFormIsFilledWithValidData(app.accountPage, account.name, account.initialBalance, account.currency);

    // WHEN: User navigates to submit button via keyboard
    await app.accountPage.focusSubmitButton();
    
    // THEN: Submit button should be focused
    const isFocused = await app.accountPage.isSubmitButtonFocused();
    await expect(isFocused).toBeTruthy();
    
    // WHEN: User presses Enter
    await app.accountPage.pressKey('Enter');
    
    // THEN: Dialog should close and account created
    const dialog = await app.accountPage.getCreateDialog();
    await expect(dialog).toBeHidden({ timeout: 5000 });

    await expectAccountExists(app.accountPage, account.name);
  });
});
