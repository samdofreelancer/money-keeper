import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { generateTestAccountName } from '@/test-data/test-name.util';
import { logger } from '@/utils/logger';
import { 
  givenAccountFormIsOpen, 
  givenFormIsFilledWithValidData, 
  whenUserPressesEscape,
  whenUserFocusesSubmitButton,
  whenUserPressesEnter,
  thenFormShouldHaveAccessibilityAttributes,
  thenSubmitButtonShouldBeFocused,
  thenDialogShouldBeClosed,
  thenAccountShouldBeCreatedSuccessfully
} from './account-creation.scenario';

/**
 * Account Creation - Accessibility Tests
 * 
 * Tests WCAG compliance and keyboard navigation
 * ✅ Auto-cleanup: All TEST_ accounts deleted after each test
 */

test.describe('Account Creation / Accessibility', () => {
  test('should ensure form elements have proper accessibility attributes', async ({ app }) => {
    // GIVEN: Account form is open
    await givenAccountFormIsOpen(app.accountPage);

    // THEN: Form should have proper accessibility attributes
    await thenFormShouldHaveAccessibilityAttributes(app.accountPage);
    
    logger.success('Form has proper accessibility attributes');

    // WHEN: User presses Escape key
    await whenUserPressesEscape(app.accountPage);
    
    // THEN: Dialog should close
    await thenDialogShouldBeClosed(app.accountPage);

    logger.success('Escape key closes dialog');
  });

  test('should support keyboard navigation for form submission', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'KeyboardNav'))
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    // GIVEN: Form is open and filled with valid data
    await givenAccountFormIsOpen(app.accountPage);
    await givenFormIsFilledWithValidData(app.accountPage, account.name, account.initialBalance, account.currency);

    // WHEN: User navigates to submit button via keyboard
    await whenUserFocusesSubmitButton(app.accountPage);
    
    // THEN: Submit button should be focused
    await thenSubmitButtonShouldBeFocused(app.accountPage);
    
    logger.success('Submit button is focused via keyboard');

    // WHEN: User presses Enter
    await whenUserPressesEnter(app.accountPage);
    
    // THEN: Dialog should close and account created
    await thenDialogShouldBeClosed(app.accountPage);
    await thenAccountShouldBeCreatedSuccessfully(app.accountPage, account.name);

    logger.success('Form submitted successfully via keyboard');
  });
});
