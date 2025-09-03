import { Logger } from 'shared/utilities/logger';
import { AccountCreateDto } from 'account-domains/types/account.dto';
import { AccountApiClient } from 'account-domains/api/account-api.client';
import { Inject, Transient, TOKENS } from 'shared/di';

/**
 * Use case for account creation via API
 */
@Transient({ token: TOKENS.AccountCreationApiUseCase })
export class AccountCreationApiUseCase {
  constructor(
    @Inject(TOKENS.AccountApiClient)
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
