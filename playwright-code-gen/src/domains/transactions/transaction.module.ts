import { Module } from '@nestjs/common';
import { Page } from 'playwright';
import { TOKENS } from '../../shared/di/nest-tokens';
import { TransactionsPage } from './pages/transactions.playwright.page';
import { TransactionCreationUiUseCase } from './usecases/ui/TransactionCreationUiUseCase';
import { TransactionCreationApiUseCase } from './usecases/api/TransactionCreationApiUseCase';
import { SharedModule } from '../../shared/di/shared.module';

@Module({
  imports: [SharedModule],
  providers: [
    // All services are now auto-registered via @AutoInjectable()
  ],
  exports: [
    // No exports needed since services are auto-registered
  ],
})
export class TransactionModule {}
