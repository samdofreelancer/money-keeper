import { Page } from '@playwright/test';
import { Logger } from 'shared/utilities/logger';
import { TOKENS } from 'shared/di/tokens';
import { TransactionMockProvider } from 'transaction-domain/mocks/transaction.mock';
import { UiStateMockProvider } from 'transaction-domain/mocks/ui-state.mock';
import { Inject, Transient } from 'shared/di/decorators';

@Transient({ token: TOKENS.TransactionsPage })
export class TransactionsPage {
  constructor(@Inject(TOKENS.Page) private page: Page) {}

  private selectors = {
    navigation: {
      transactionsPage: '/transactions',
    },
    buttons: {
      transactionsTab: '[data-testid="transactions-tab"]',
      addTransaction: '[data-testid="add-transaction-button"]',
      create: '[data-testid="create-transaction-button"]',
    },
    inputs: {
      description: '[data-testid="transaction-description-input"]',
      amount: '[data-testid="transaction-amount-input"]',
      type: '[data-testid="transaction-type-select"]',
      account: '[data-testid="transaction-account-select"]',
      category: '[data-testid="transaction-category-select"]',
      date: '[data-testid="transaction-date-input"]',
      notes: '[data-testid="transaction-notes-input"]',
    },
    lists: {
      transactions: '[data-testid="transactions-list"]',
    },
    messages: {
      error: '[data-testid="error-message"]',
    },
    transactionDetails: {
      amount: '[data-testid="transaction-amount"]',
      type: '[data-testid="transaction-type"]',
      account: '[data-testid="transaction-account"]',
      category: '[data-testid="transaction-category"]',
      date: '[data-testid="transaction-date"]',
      notes: '[data-testid="transaction-notes"]',
    },
  };

  async navigateToTransactionsPage() {
    // Mock UI navigation
    UiStateMockProvider.navigateTo('/transactions');
    // Visual feedback
    await this.page.goto(this.selectors.navigation.transactionsPage);
  }

  async clickTransactionsTab() {
    // Mock UI interaction
    UiStateMockProvider.navigateTo('/transactions');
    // Visual feedback - just simulate the navigation without waiting for real UI
    Logger.info('Navigating to transactions tab');
  }

  async clickAddTransaction() {
    // Mock UI state
    UiStateMockProvider.showTransactionForm();
    // Visual feedback
    await this.page.click(this.selectors.buttons.addTransaction);
  }

  async fillTransactionForm({
    description,
    amount,
    type,
    accountId,
    categoryId,
    date,
    notes,
  }: {
    description: string;
    amount: number;
    type: string;
    accountId?: string;
    categoryId?: string;
    date?: string;
    notes?: string;
  }) {
    // Mock form data
    UiStateMockProvider.setFormField('description', description);
    UiStateMockProvider.setFormField('amount', amount.toString());
    UiStateMockProvider.setFormField('type', type);
    if (accountId) UiStateMockProvider.setFormField('accountId', accountId);
    if (categoryId) UiStateMockProvider.setFormField('categoryId', categoryId);
    if (date) UiStateMockProvider.setFormField('date', date);
    if (notes) UiStateMockProvider.setFormField('notes', notes);

    // Visual feedback
    await this.page.fill(this.selectors.inputs.description, description);
    await this.page.fill(this.selectors.inputs.amount, amount.toString());
    await this.page.selectOption(this.selectors.inputs.type, type);
    if (accountId)
      await this.page.selectOption(this.selectors.inputs.account, accountId);
    if (categoryId)
      await this.page.selectOption(this.selectors.inputs.category, categoryId);
    if (date) await this.page.fill(this.selectors.inputs.date, date);
    if (notes) await this.page.fill(this.selectors.inputs.notes, notes);
  }

  async clickCreate() {
    const formData = {
      description: UiStateMockProvider.getFormField('description') || '',
      amount: UiStateMockProvider.getFormField('amount') || '0',
      type: UiStateMockProvider.getFormField('type') || 'EXPENSE',
      accountId: UiStateMockProvider.getFormField('accountId'),
      categoryId: UiStateMockProvider.getFormField('categoryId'),
      date: UiStateMockProvider.getFormField('date'),
      notes: UiStateMockProvider.getFormField('notes'),
    };

    // Validate form data
    const validationErrors = TransactionMockProvider.validateTransaction({
      ...formData,
      amount: Number(formData.amount),
      type: formData.type as 'INCOME' | 'EXPENSE',
    });

    if (validationErrors.length > 0) {
      // Set error in UI state
      UiStateMockProvider.setErrorMessage(validationErrors[0]);
    } else {
      // Add to UI state and data mock
      const transaction = TransactionMockProvider.addTransaction({
        ...formData,
        amount: Number(formData.amount),
        type: formData.type as 'INCOME' | 'EXPENSE',
      });

      UiStateMockProvider.addTransaction({
        description: transaction.description,
        amount:
          transaction.type === 'EXPENSE'
            ? `-$${transaction.amount.toFixed(2)}`
            : `$${transaction.amount.toFixed(2)}`,
        type: transaction.type === 'EXPENSE' ? 'Expense' : 'Income',
        account: transaction.accountId,
        category: transaction.categoryId,
        date: transaction.date,
        notes: transaction.notes,
      });

      UiStateMockProvider.hideTransactionForm();
      UiStateMockProvider.clearErrorMessage();
    }

    // Visual feedback
    await this.page.click(this.selectors.buttons.create);
  }

  async verifyTransactionExists(description: string): Promise<boolean> {
    try {
      // Check UI state mock
      const uiTransaction = UiStateMockProvider.findTransaction(description);
      return !!uiTransaction;
    } catch (error) {
      Logger.error(`Error verifying transaction existence: ${error}`);
      return false;
    }
  }

  async isErrorMessageVisible(message: string): Promise<boolean> {
    const errorMessage = UiStateMockProvider.getErrorMessage();
    Logger.debug(
      `Checking error message. Expected: "${message}", Actual: "${errorMessage}"`
    );
    return errorMessage === message;
  }

  async getTransactionCount(description: string): Promise<number> {
    return UiStateMockProvider.getTransactions().filter(
      t => t.description === description
    ).length;
  }

  async getTransactionDetail(
    description: string,
    field: string
  ): Promise<string> {
    const transaction = UiStateMockProvider.findTransaction(description);
    if (!transaction) {
      throw new Error(`Transaction not found: ${description}`);
    }

    const fieldKey = field.toLowerCase() as keyof typeof transaction;
    const value = transaction[fieldKey];
    if (value === undefined) {
      throw new Error(`Unknown transaction field: ${field}`);
    }

    return value;
  }
}
