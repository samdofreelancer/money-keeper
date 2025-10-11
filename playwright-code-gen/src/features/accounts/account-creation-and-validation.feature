@accounts @account-creation @regression
Feature: Account Creation and Validation
  As a money management user
  I want to create new financial accounts and be prevented from creating invalid ones
  So that I can track my income and expenses with correct data

  Background:
    Given I am logged into the money management system

  @smoke @positive
  Scenario: Successfully create a new account
    When I create a new account with:
      | name        | My Savings Account |
      | type        | Bank Account            |
      | balance     | 5000               |
      | currency    | USD                |
      | description | Emergency fund     |
    Then I should see the account "My Savings Account" in my accounts list
    And the account should have a balance of "$5,000.00"

  @negative
  Scenario: Attempt to create account with duplicate name
    Given I have an existing account named "Main Checking"
    When I attempt to create another account with:
      | name        | Main Checking |
      | type        | Bank Account      |
      | balance     | 1000          |
      | currency    | USD           |
    #    #Then I should see an error message "Account name already exists"
    Then the account "Main Checking" should appear only once in my accounts list

  @negative
  Scenario: Show error when creating account with zero balance
    When I create a new account with:
      | name        | zero bank account |
      | type        | Bank Account      |
      | balance     | 0                 |
      | currency    | USD               |
      | description |                   |
    Then I should see the error message "Balance must be greater than 0"

  @positive
  Scenario: Successfully create a bank account with Euro currency
    And I set default currency to "VND" in settings
    When I create a new account with:
      | name        | bank account with crrency not a default USD |
      | type        | Bank Account      |
      | balance     | 100              |
      | currency    | Euro             |
      | description | Create bank account with currency as a Euro |
    Then I should see the success message "Account created successfully"
    And the account "bank account with crrency not a default USD" should appear in my accounts list with balance "€100.00"
    And the total balance should be shown in default currency from settings

  @negative
  Scenario: Attempt to create account with empty name
    When I attempt to create a new account with:
      | name        |  |
      | type        | Bank Account |
      | balance     | 1000         |
      | currency    | USD          |
      | description | Test          |
    Then I should see an error message "Please input account name"

  @negative
  Scenario: Attempt to create account with negative balance
    When I attempt to create a new account with:
      | name        | Negative Balance Account |
      | type        | Bank Account             |
      | balance     | -100                     |
      | currency    | USD                      |
      | description | Test                     |
    Then I should see an error message "Balance must be greater than 0"

  @negative
  Scenario: Attempt to create account with name too long
    When I attempt to create a new account with:
      | name        | LONG_NAME |
      | type        | Bank Account |
      | balance     | 1000         |
      | currency    | USD          |
      | description | Test          |
    Then I should see an error message "Account name must be at most 255 characters"

  @negative
  Scenario: Attempt to create account with description too long
    When I attempt to create a new account with:
      | name        | Long Desc Account |
      | type        | Bank Account      |
      | balance     | 1000              |
      | currency    | USD               |
      | description | LONG_DESCRIPTION  |
    Then I should see an error message "Description must be at most 1000 characters"

  @positive
  Scenario: Successfully create an e-wallet account
    When I create a new account with:
      | name        | My E-Wallet |
      | type        | E-Wallet     |
      | balance     | 200          |
      | currency    | USD          |
      | description | Cash on hand |
    Then I should see the account "My E-Wallet" in my accounts list
    And the account should have a balance of "$200.00"

  @positive
  Scenario: Successfully create another bank account
    When I create a new account with:
      | name        | My Credit Card |
      | type        | Bank Account   |
      | balance     | 500            |
      | currency    | USD            |
      | description | Credit limit   |
    Then I should see the account "My Credit Card" in my accounts list
    And the account should have a balance of "$500.00"

  @positive
  Scenario: Successfully create an account with VND currency
    When I create a new account with:
      | name        | VND Savings    |
      | type        | Bank Account   |
      | balance     | 1000000        |
      | currency    | VND            |
      | description | Vietnamese Dong|
    Then I should see the account "VND Savings" in my accounts list
    And the account should have a balance of "₫1,000,000"

  @positive
  Scenario: Successfully create an account without description
    When I create a new account with:
      | name        | No Desc Account |
      | type        | Bank Account    |
      | balance     | 1500            |
      | currency    | USD             |
    Then I should see the account "No Desc Account" in my accounts list
    And the account should have a balance of "$1,500.00"
