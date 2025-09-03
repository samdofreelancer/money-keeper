import { TransactionCreateDto } from 'transaction-domain/types/transaction.dto';
import { Logger } from 'shared/utilities/logger';
import { TransactionMockProvider } from 'transaction-domain/mocks/transaction.mock';
import { Inject, Transient, TOKENS } from 'shared/di';

@Transient({ token: TOKENS.TransactionCreationApiUseCase })
export class TransactionCreationApiUseCase {
  constructor(
    @Inject(TOKENS.ApiBaseUrl) private readonly baseUrl: string,
    private readonly token?: string
  ) {}

  async createTransaction(
    transactionData: TransactionCreateDto
  ): Promise<void> {
    try {
      Logger.info(`Creating transaction: ${transactionData.description}`);

      // Validate transaction data
      const validationErrors =
        TransactionMockProvider.validateTransaction(transactionData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Create mock transaction
      const mockTransaction =
        TransactionMockProvider.addTransaction(transactionData);
      Logger.info(
        `Successfully created mock transaction with ID: ${mockTransaction.id}`
      );
    } catch (error) {
      Logger.error('Error creating transaction:', error);
      throw error;
    }
  }
}
