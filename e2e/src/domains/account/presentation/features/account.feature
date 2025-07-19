@focus
Feature: Account Creation
  As a user
  I want to create new accounts
  So that I can manage my finances across different account types

  Background:
    Given I am on the Money Keeper application
    And I have access to the account management features

  Scenario: Successfully create a bank account
    When I create a new bank account with the following details:
      | Account Name    | My Checking Account |
      | Account Type    | Bank Account        |
      | Initial Balance | 1000.00             |
      | Currency        | USD                 |
      | Description     | Primary checking    |
    Then I should see the account "My Checking Account" in my list
    And the total balance should be at least "1000.00"

  Scenario: Duplicate account name is not allowed
    Given I have an existing account named "My Savings"
    When I try to create another account named "My Savings"
    Then I should see an error about duplicate account name

  Scenario: Cannot create account with invalid input
    When I try to create a bank account with:
      | Account Name    |       |
      | Account Type    | Bank Account |
      | Initial Balance | -100  |
    Then I should see validation errors
