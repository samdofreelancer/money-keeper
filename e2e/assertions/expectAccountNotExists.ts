import { expect } from '@playwright/test';
import { AccountPage } from '@/pages/AccountPage';

/**
 * Assertion: Account Does Not Exist (Future Implementation)
 * 
 * Verifies that an account has been removed from the list.
 * Currently in development - requires account list retrieval.
 * 
 * TODO: Implement after account list retrieval is working
 */
export async function expectAccountNotExists(
  accountPage: AccountPage,
  accountName: string
) {
  // TODO: Implement account list retrieval methods in PageObject
  throw new Error('expectAccountNotExists not yet implemented');
}
