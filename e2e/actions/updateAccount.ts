import { AccountPage } from '@/pages/AccountPage';
import { AccountData } from '@/test-data/account.builder';

/**
 * Update Account Action (Future Implementation)
 * 
 * Represents the business action: "update an existing account"
 * Currently in development - not implemented yet.
 * 
 * TODO: Implement account list item interactions
 */
export async function updateAccount(
  _accountPage: AccountPage,
  _oldName: string,
  _newAccount: Partial<AccountData>
) {
  // TODO: Implement after account list retrieval is working
  throw new Error('updateAccount not yet implemented');
}
