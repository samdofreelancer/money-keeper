import { Given, When, Then, Before } from '@cucumber/cucumber';
import {
  getTransactionsPage,
  getTransactionCreationUiUseCase,
} from 'shared/utilities/hooks';
import { TransactionCreateDto } from 'transaction-domain/types/transaction.dto';

Before(async function () {
  const transactionCreationUiUseCase = getTransactionCreationUiUseCase();
  transactionCreationUiUseCase.resetState();
});

Given(
  'I have access to the transactions management section',
  async function () {
    const transactionsPage = getTransactionsPage();
    await transactionsPage.clickTransactionsTab();
  }
);

When(
  'I create a new transaction with:',
  async function (dataTable: { rowsHash: () => Record<string, string> }) {
    const data = dataTable.rowsHash();
    const transactionCreationUiUseCase = getTransactionCreationUiUseCase();

    // Store the transaction data for later verification
    const transactionData = new TransactionCreateDto({
      description: data['description'],
      amount: Number(data['amount']),
      type: data['type'] as 'INCOME' | 'EXPENSE',
      accountId: data['account'],
      categoryId: data['category'],
      date: data['date'],
      notes: data['notes'],
    });

    // Store the data in world context for later steps
    (this as { currentTransaction?: TransactionCreateDto }).currentTransaction =
      transactionData;

    await transactionCreationUiUseCase.createTransaction(transactionData);
  }
);

When(
  'I attempt to create a transaction with:',
  async function (dataTable: { rowsHash: () => Record<string, string> }) {
    const data = dataTable.rowsHash();
    const transactionCreationUiUseCase = getTransactionCreationUiUseCase();

    const transactionData = new TransactionCreateDto({
      description: data['description'],
      amount: Number(data['amount']),
      type: data['type'] as 'INCOME' | 'EXPENSE',
      accountId: data['account'],
      categoryId: data['category'],
      date: data['date'],
      notes: data['notes'],
    });

    await transactionCreationUiUseCase.createTransaction(transactionData);
  }
);

Then(
  'I should see the transaction {string} in my transactions list',
  async function (description: string) {
    const transactionsPage = getTransactionsPage();
    const transactionCreationUiUseCase = getTransactionCreationUiUseCase();

    // Reload the page to ensure we have the latest state
    await transactionCreationUiUseCase.reloadTransactionsPage();

    const exists = await transactionsPage.verifyTransactionExists(description);
    if (!exists) {
      throw new Error(
        `Transaction "${description}" not found in transactions list`
      );
    }
  }
);

Then(
  'the transaction details should match:',
  async function (dataTable: { rowsHash: () => Record<string, string> }) {
    const data = dataTable.rowsHash();
    const transactionsPage = getTransactionsPage();
    const currentTransaction = (
      this as { currentTransaction?: TransactionCreateDto }
    ).currentTransaction;

    if (!currentTransaction) {
      throw new Error('No transaction data found in test context');
    }

    // Verify each provided field
    for (const [key, expectedValue] of Object.entries(data)) {
      const actualValue = await transactionsPage.getTransactionDetail(
        currentTransaction.description,
        key
      );
      if (actualValue !== expectedValue) {
        throw new Error(
          `Expected transaction ${key} to be "${expectedValue}", but found "${actualValue}"`
        );
      }
    }
  }
);

Then('the transaction should not be created', async function () {
  const transactionsPage = getTransactionsPage();
  const currentTransaction = (
    this as { currentTransaction?: TransactionCreateDto }
  ).currentTransaction;

  if (!currentTransaction) {
    throw new Error('No transaction data found in test context');
  }

  const exists = await transactionsPage.verifyTransactionExists(
    currentTransaction.description
  );
  if (exists) {
    throw new Error('Transaction was created when it should not have been');
  }
});

Then(
  'the transaction amount should be {string}',
  async function (expectedAmount: string) {
    const transactionsPage = getTransactionsPage();
    const currentTransaction = (
      this as { currentTransaction?: TransactionCreateDto }
    ).currentTransaction;

    if (!currentTransaction) {
      throw new Error('No transaction data found in test context');
    }

    const actualAmount = await transactionsPage.getTransactionDetail(
      currentTransaction.description,
      'amount'
    );
    if (actualAmount !== expectedAmount) {
      throw new Error(
        `Expected transaction amount to be "${expectedAmount}", but found "${actualAmount}"`
      );
    }
  }
);
