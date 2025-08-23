import { Module } from '@nestjs/common';
import { TOKENS } from '../../shared/di/nest-tokens';
import { TransactionsPage } from './pages/transactions.playwright.page';
import { TransactionCreationUiUseCase } from './usecases/ui/TransactionCreationUiUseCase';
import { TransactionCreationApiUseCase } from './usecases/api/TransactionCreationApiUseCase';

@Module({
  providers: [
    // Page Object
    {
      provide: TOKENS.TransactionsPage,
      useFactory: (page: any) => new TransactionsPage(page),
      inject: [TOKENS.Page],
    },
    
    // UI Usecases
    {
      provide: TOKENS.TransactionCreationUiUseCase,
      useFactory: (transactionsPage: TransactionsPage) => 
        new TransactionCreationUiUseCase(transactionsPage),
      inject: [TOKENS.TransactionsPage],
    },
    
    // API Usecases
    {
      provide: TOKENS.TransactionCreationApiUseCase,
      useFactory: () => 
        new TransactionCreationApiUseCase(
          process.env.API_BASE_URL ?? 'http://localhost:8080'
        ),
      inject: [],
    },
  ],
  exports: [
    TOKENS.TransactionsPage,
    TOKENS.TransactionCreationUiUseCase,
    TOKENS.TransactionCreationApiUseCase,
  ],
})
export class TransactionModule {}
