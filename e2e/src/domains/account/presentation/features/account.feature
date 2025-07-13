Feature: Account Creation
  As a user
  I want to create new accounts
  So that I can manage my finances across different account types

  Scenario: Successfully create a bank account
    Given I am on the Money Keeper application
    And I have access to the account management features
    When I click the "Add Account" button
    And I fill in the account form with:
      | Field           | Value               |
      | Account Name    | My Checking Account |
      | Account Type    | BANK_ACCOUNT        |
      | Initial Balance | 1000.00             |
      | Currency        | USD                 |
      | Description     | Primary checking    |
    And I submit the form
    Then the account should be created successfully
    And I should see the account in the accounts list
    And the total balance should be updated

  Scenario: Create account with duplicate name fails
    Given I have an existing account named "My Savings"
    When I try to create another account with the same name "My Savings"
    Then I should receive a conflict error
    And the account should not be created

  Scenario: Create account with invalid data fails
    Given I am on the create account form
    When I try to submit with:
      | Field           | Value |
      | Account Name    |       |
      | Initial Balance | -100  |
    Then I should see validation errors
    And the account should not be created
