import { AccountPage } from '@/pages/AccountPage';

/**
 * Delete Account Action (Future Implementation)
 * 
 * Represents the business action: "delete an account"
 * Currently in development - not implemented yet.
 * 
 * TODO: Implement account list item interactions
 */
export async function deleteAccount(_accountPage: AccountPage, _accountName: string) {
  // TODO: Implement after account list retrieval is working
  throw new Error('deleteAccount not yet implemented');
}

/**
 * Delete Account (Cancel) Action (Future Implementation)
 */
export async function cancelDeleteAccount(
  _accountPage: AccountPage,
  _accountName: string
) {
  // TODO: Implement after account list retrieval is working
  throw new Error('cancelDeleteAccount not yet implemented');
}
