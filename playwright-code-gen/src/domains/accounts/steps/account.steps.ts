import { When, Then } from '@cucumber/cucumber';
import {
  getAccountCreationApiUseCase,
  getAccountsPage,
} from 'shared/utilities/hooks';
import { TestData } from 'shared/utilities/testData';
import {
  AccountDto,
  AccountCreateDto,
} from 'account-domains/types/account.dto';

When(
  'I navigate to accounts via clicking {string}',
  async function (tabName: string) {
    const accountsPage = getAccountsPage();
    if (tabName === 'Accounts') {
      await accountsPage.clickAccountsTab();
    }
  }
);

When(
  'I create a new account with the following details:',
  async function (dataTable: { rowsHash: () => Record<string, string> }) {
    const dataTableHash = dataTable.rowsHash();
    const scenarioName =
      (this as { scenarioName?: string }).scenarioName || 'unknown-scenario';

    const accountData: AccountDto = {
      name: TestData.generateUniqueAccountName(
        scenarioName,
        dataTableHash['Name']
      ),
      type: dataTableHash['Type'],
      balance: Number(dataTableHash['Balance']) || 1000,
      currency: dataTableHash['Currency'],
      description: dataTableHash['Description'],
    };

    TestData.trackCreatedAccount(accountData.name);

    const accountCreationUiUseCase = getAccountCreationApiUseCase();
    await accountCreationUiUseCase.createAccount(
      AccountCreateDto.fromAccountDto(accountData)
    );
  }
);

When(
  'I try to create the same account again with the following details:',
  async function (dataTable: { rowsHash: () => Record<string, string> }) {
    const dataTableHash = dataTable.rowsHash();

    const scenarioName =
      (this as { scenarioName?: string }).scenarioName || 'unknown-scenario';

    const accountData: AccountDto = {
      name: TestData.generateUniqueAccountName(
        scenarioName,
        dataTableHash['Name']
      ),
      type: dataTableHash['Type'],
      balance: Number(dataTableHash['Balance']) || 1000,
      currency: dataTableHash['Currency'],
      description: dataTableHash['Description'],
    };

    const accountCreationUiUseCase = getAccountCreationApiUseCase();
    await accountCreationUiUseCase.createAccount(
      AccountCreateDto.fromAccountDto(accountData)
    );
  }
);

Then('I should see a success message', async function () {
  const accountsPage = getAccountsPage();
  if (!(await accountsPage.isSuccessMessageVisible())) {
    throw new Error('Success message not visible');
  }
});

Then(
  'I should see the error message {string}',
  async function (errorMessage: string) {
    const accountsPage = getAccountsPage();
    if (!(await accountsPage.isErrorMessageVisible(errorMessage))) {
      throw new Error(`Error message "${errorMessage}" not visible`);
    }
  }
);
