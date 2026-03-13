import { AccountPage } from '@/pages/AccountPage';
import { logger } from '@/utils/logger';

/**
 * Update Account Action
 *
 * Business action: "Update account name"
 *
 * Orchestrates UI steps to update account details.
 * Does NOT assert - that's for assertions module.
 *
 * Usage:
 *   await updateAccount(accountPage, 'Old Account', 'New Account');
 */
export async function updateAccount(
  accountPage: AccountPage,
  oldName: string,
  newName: string
) {
  logger.info(`Updating account: ${oldName} -> ${newName}`);

  // TODO: Implement update action
  // This requires editing account row in table (click edit button, update dialog, save)
  throw new Error('updateAccount not yet implemented - requires table edit flow');
}

