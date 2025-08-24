import { TransactionsPage } from './pages/transactions.playwright.page';
import { TransactionCreationUiUseCase } from './usecases/ui/TransactionCreationUiUseCase';
import { TransactionCreationApiUseCase } from './usecases/api/TransactionCreationApiUseCase';

// Export the services for use in the DI container setup
// The @Service decorators will handle automatic registration
export {
  TransactionsPage,
  TransactionCreationUiUseCase,
  TransactionCreationApiUseCase,
};
