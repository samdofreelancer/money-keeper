import { Module } from '@nestjs/common';
import { AccountApiClient } from './api/account-api.client';
import { AccountsPlaywrightPage } from './pages/accounts.playwright.page';
import { AccountCreationApiUseCase } from './usecases/api/AccountCreationApiUseCase';
import { AccountDeletionApiUseCase } from './usecases/api/AccountDeletionApiUseCase';
import { AccountBalanceUiUseCase } from './usecases/ui/AccountBalanceUiUseCase';
import { AccountCreationUiUseCase } from './usecases/ui/AccountCreationUiUseCase';
import { SharedModule } from '../../shared/di/shared.module';
import { TOKENS } from '../../shared/di/nest-tokens';

@Module({
  imports: [SharedModule],
  providers: [
    {
      provide: TOKENS.AccountsPlaywrightPage,
      useClass: AccountsPlaywrightPage,
    },
    {
      provide: TOKENS.AccountBalanceUiUseCase,
      useClass: AccountBalanceUiUseCase,
    },
    {
      provide: TOKENS.AccountCreationUiUseCase,
      useClass: AccountCreationUiUseCase,
    },
  ],
  exports: [
    TOKENS.AccountsPlaywrightPage,
    TOKENS.AccountBalanceUiUseCase,
    TOKENS.AccountCreationUiUseCase,
  ],
})
export class AccountModule {}
