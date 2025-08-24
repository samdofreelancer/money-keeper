import { Module } from '@nestjs/common';
import { Page } from 'playwright';
import { TOKENS } from '../../shared/di/nest-tokens';
import { TransactionsPage } from './pages/transactions.playwright.page';
import { TransactionCreationUiUseCase } from './usecases/ui/TransactionCreationUiUseCase';
import { TransactionCreationApiUseCase } from './usecases/api/TransactionCreationApiUseCase';

@Module({
  imports: [],
  providers: [
    // Page Object
    {
      provide: TOKENS.TransactionsPage,
      useFactory: (page: Page) => new TransactionsPage(page),
      inject: [TOKENS.Page],
    },

    // UI Usecases
    {
      provide: TransactionCreationUiUseCase,
      useFactory: (transactionsPage: TransactionsPage) =>
        new TransactionCreationUiUseCase(transactionsPage),
      inject: [TransactionsPage],
    },

    // API Usecases
    {
      provide: TOKENS.TransactionCreationApiUseCase,
      useFactory: (baseUrl: string) =>
        new TransactionCreationApiUseCase(baseUrl),
      inject: [TOKENS.ApiBaseUrl],
    },
  ],
  exports: [
    TOKENS.TransactionsPage,
    TransactionCreationUiUseCase,
    TOKENS.TransactionCreationApiUseCase,
  ],
})
export class TransactionModule {}
