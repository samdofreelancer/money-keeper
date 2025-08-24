import { Service, Inject } from '../../../../shared/di/decorators';
import { TransactionsPage } from '../../pages/transactions.playwright.page';
import { TransactionCreateDto } from '../../types/transaction.dto';
import { TransactionMockProvider } from '../../mocks/transaction.mock';
import { UiStateMockProvider } from '../../mocks/ui-state.mock';
import { TOKENS } from '../../../../shared/di/tokens';

@Service({ scope: 'transient', token: TOKENS.TransactionCreationUiUseCase })
export class TransactionCreationUiUseCase {
  //constructor(@Inject(TOKENS.TransactionsPage) private readonly transactionsPage: TransactionsPage) {}

  constructor(private readonly transactionsPage: TransactionsPage) {}

  async createTransaction(transactionData: TransactionCreateDto) {
    // Simulate UI interactions (keep these for visual feedback)
    await this.transactionsPage.clickAddTransaction();
    await this.transactionsPage.fillTransactionForm({
      description: transactionData.description,
      amount: transactionData.amount,
      type: transactionData.type,
      accountId: transactionData.accountId,
      categoryId: transactionData.categoryId,
      date: transactionData.date,
      notes: transactionData.notes,
    });
    await this.transactionsPage.clickCreate();

    // Validate and create mock transaction
    const validationErrors =
      TransactionMockProvider.validateTransaction(transactionData);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }

    TransactionMockProvider.addTransaction(transactionData);
  }

  async verifyTransactionCreated(description: string): Promise<boolean> {
    return await this.transactionsPage.verifyTransactionExists(description);
  }

  async reloadTransactionsPage() {
    await this.transactionsPage.navigateToTransactionsPage();
  }

  resetState() {
    UiStateMockProvider.resetState();
    TransactionMockProvider.reset();
  }
}
