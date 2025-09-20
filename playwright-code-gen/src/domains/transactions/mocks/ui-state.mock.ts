import { Logger } from 'shared/utilities/logger';

export interface UiState {
  currentPage: string;
  formVisible: boolean;
  errorMessage?: string;
  formData: {
    description?: string;
    amount?: string;
    type?: string;
    accountId?: string;
    categoryId?: string;
    date?: string;
    notes?: string;
  };
  transactions: Array<{
    description: string;
    amount: string;
    type: string;
    account?: string;
    category?: string;
    date?: string;
    notes?: string;
  }>;
}

export class UiStateMockProvider {
  private static state: UiState = {
    currentPage: '/',
    formVisible: false,
    formData: {},
    transactions: [],
  };

  static resetState(): void {
    this.state = {
      currentPage: '/',
      formVisible: false,
      formData: {},
      transactions: [],
    };
    Logger.info('UI state has been reset');
  }

  static navigateTo(page: string): void {
    this.state.currentPage = page;
    Logger.info(`Navigated to ${page}`);
  }

  static getCurrentPage(): string {
    return this.state.currentPage;
  }

  static showTransactionForm(): void {
    this.state.formVisible = true;
    this.state.formData = {};
    Logger.info('Transaction form displayed');
  }

  static hideTransactionForm(): void {
    this.state.formVisible = false;
    this.state.formData = {};
    Logger.info('Transaction form hidden');
  }

  static setFormField(field: keyof UiState['formData'], value: string): void {
    this.state.formData[field] = value;
    Logger.debug(`Form field ${field} set to ${value}`);
  }

  static getFormField(field: keyof UiState['formData']): string | undefined {
    return this.state.formData[field];
  }

  static isFormVisible(): boolean {
    return this.state.formVisible;
  }

  static addTransaction(transaction: UiState['transactions'][0]): void {
    this.state.transactions.push(transaction);
    Logger.info(`Transaction added: ${transaction.description}`);
  }

  static getTransactions(): UiState['transactions'] {
    return [...this.state.transactions];
  }

  static findTransaction(
    description: string
  ): UiState['transactions'][0] | undefined {
    return this.state.transactions.find(t => t.description === description);
  }

  static setErrorMessage(message: string): void {
    this.state.errorMessage = message;
    Logger.info(`Error message set: ${message}`);
  }

  static clearErrorMessage(): void {
    this.state.errorMessage = undefined;
    Logger.info('Error message cleared');
  }

  static getErrorMessage(): string | undefined {
    return this.state.errorMessage;
  }
}
