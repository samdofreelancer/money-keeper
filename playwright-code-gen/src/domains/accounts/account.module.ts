import { Module } from '@nestjs/common';
import { AccountApiClient } from './api/account-api.client';
import { AccountsPlaywrightPage } from './pages/accounts.playwright.page';
import { AccountCreationApiUseCase } from './usecases/api/AccountCreationApiUseCase';
import { AccountDeletionApiUseCase } from './usecases/api/AccountDeletionApiUseCase';
import { AccountBalanceUiUseCase } from './usecases/ui/AccountBalanceUiUseCase';
import { AccountCreationUiUseCase } from './usecases/ui/AccountCreationUiUseCase';

@Module({
  providers: [
    AccountApiClient,
    AccountsPlaywrightPage,
    AccountCreationApiUseCase,
    AccountDeletionApiUseCase,
    AccountBalanceUiUseCase,
    AccountCreationUiUseCase,
  ],
  exports: [
    AccountApiClient,
    AccountsPlaywrightPage,
    AccountCreationApiUseCase,
    AccountDeletionApiUseCase,
    AccountBalanceUiUseCase,
    AccountCreationUiUseCase,
  ],
})
export class AccountModule {}
