import { AccountPage } from '@/pages/AccountPage';
import { logger } from '@/utils/logger';

/**
 * Delete Account Action
 *
 * Business action: "Delete an account"
 *
 * Orchestrates UI steps to delete an account.
 * Does NOT assert - that's for assertions module.
 *
 * Usage:
 *   await deleteAccount(accountPage, 'Account to Delete');
 */
export async function deleteAccount(
  accountPage: AccountPage,
  accountName: string
) {
  logger.info(`Deleting account: ${accountName}`);

  // TODO: Implement delete action
  // This requires finding account row, clicking delete button, confirming deletion
  throw new Error('deleteAccount not yet implemented - requires table delete flow');
}
