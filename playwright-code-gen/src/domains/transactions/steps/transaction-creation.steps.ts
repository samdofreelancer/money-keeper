import { Given, When, Then, Before } from '@cucumber/cucumber';
import { TransactionVerify } from '../verification/transaction.verify';
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

    const verifier = new TransactionVerify(this.page, transactionsPage);
    await verifier.shouldSeeTransaction(description);
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
    const verifier = new TransactionVerify(this.page, transactionsPage);
    for (const [key, expectedValue] of Object.entries(data)) {
      await verifier.shouldHaveTransactionDetail(
        currentTransaction.description,
        key,
        expectedValue
      );
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

  await transactionsPage.verifyTransactionExists(
    currentTransaction.description
  );
  const verifier = new TransactionVerify(this.page, transactionsPage);
  await verifier.shouldNotSeeTransaction(currentTransaction.description);
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

    const verifier = new TransactionVerify(this.page, transactionsPage);
    await verifier.shouldHaveTransactionAmount(
      currentTransaction.description,
      expectedAmount
    );
  }
);
