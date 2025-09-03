import { TransactionCreateDto } from 'transaction-domain/types/transaction.dto';
import { Logger } from 'shared/utilities/logger';

export interface TransactionMock {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  accountId?: string;
  categoryId?: string;
  date?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class TransactionMockProvider {
  private static transactions: TransactionMock[] = [];

  static addTransaction(data: TransactionCreateDto): TransactionMock {
    const transaction: TransactionMock = {
      id: `mock-transaction-${Date.now()}`,
      description: data.description,
      amount: data.amount,
      type: data.type,
      accountId: data.accountId,
      categoryId: data.categoryId,
      date: data.date,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.transactions.push(transaction);
    return transaction;
  }

  static getTransactions(): TransactionMock[] {
    return [...this.transactions];
  }

  static findTransaction(description: string): TransactionMock | undefined {
    return this.transactions.find(t => t.description === description);
  }

  static reset(): void {
    this.transactions = [];
    Logger.info('Transaction mock data has been reset');
  }

  static validateTransaction(data: TransactionCreateDto): string[] {
    const errors: string[] = [];

    if (!data.amount || data.amount <= 0) {
      errors.push('Amount must be positive');
    }

    if (!data.description) {
      errors.push('Description is required');
    }

    if (!data.type) {
      errors.push('Type is required');
    }

    if (errors.length > 0) {
      Logger.debug(`Transaction validation errors: ${errors.join(', ')}`);
    }

    return errors;
  }
}
