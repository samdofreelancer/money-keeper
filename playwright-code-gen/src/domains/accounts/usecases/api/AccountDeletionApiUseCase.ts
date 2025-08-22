import { Logger } from '../../../../shared/utilities/logger';
import { AccountApiClient } from '../../api/account-api.client';
import { Injectable } from '@nestjs/common';

/**
 * Use case for account deletion via API
 */
@Injectable()
export class AccountDeletionApiUseCase {
  constructor(private accountApiClient: AccountApiClient) {}

  /**
   * Delete an account by name using the backend API
   */
  async deleteAccount(name: string) {
    Logger.info(`Deleting account via API: ${name}`);
    const result = await this.accountApiClient.deleteAccountByName(name);
    if (!result) {
      Logger.warn(`Failed to delete account via API: ${name}`);
    } else {
      Logger.info(`Successfully deleted account via API: ${name}`);
    }
    return result;
  }
}
