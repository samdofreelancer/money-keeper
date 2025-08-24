import { Logger } from '../../../../shared/utilities/logger';
import { AccountCreateDto } from '../../types/account.dto';
import { AccountApiClient } from '../../api/account-api.client';
import { Service } from '../../../../shared/di/decorators';

/**
 * Use case for account creation via API
 */
@Service({ scope: 'transient' })
export class AccountCreationApiUseCase {
  constructor(
    private accountApiClient: AccountApiClient
  ) {}

  /**
   * Create an account directly via backend API (bypassing UI)
   */
  async createAccount(accountData: AccountCreateDto) {
    Logger.info(`Creating account via API: ${accountData.accountName}`);
    try {
      const result = await this.accountApiClient.create(accountData);
      Logger.info(
        `Successfully created account via API: ${accountData.accountName}`
      );
      return result;
    } catch (error) {
      Logger.error(
        `Failed to create account via API: ${accountData.accountName}`,
        error
      );
      throw error;
    }
  }
}
