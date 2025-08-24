import { Logger } from '../../../../shared/utilities/logger';
import { AccountCreateDto } from '../../types/account.dto';
import { AccountApiClient } from '../../api/account-api.client';
import { Injectable, Inject } from '@nestjs/common';
import { TOKENS } from '../../../../shared/di/nest-tokens';

/**
 * Use case for account creation via API
 */
@Injectable()
export class AccountCreationApiUseCase {
  constructor(
    @Inject(TOKENS.AccountApiClient) private accountApiClient: AccountApiClient
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
