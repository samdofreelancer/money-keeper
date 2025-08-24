import { Injectable, Inject } from '@nestjs/common';
import { TransactionCreateDto } from '../../types/transaction.dto';
import { Logger } from '../../../../shared/utilities/logger';
import { TransactionMockProvider } from '../../mocks/transaction.mock';
import { TOKENS } from '../../../../shared/di/nest-tokens';

@Injectable()
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
