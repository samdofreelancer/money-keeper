@accounts @account-creation @regression
Feature: Account Creation
  As a money management user
  I want to create new financial accounts
  So that I can track my income and expenses across different accounts

  Background:
    Given I am logged into the money management system
    And I have access to the accounts management section

  @smoke @positive @focus
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
      | type        | Checking      |
      | balance     | 1000          |
      | currency    | USD           |
    Then I should see an error message "Account name already exists"
    And the account "Main Checking" should appear only once in my accounts list

  @negative
  Scenario: Attempt to create account without required fields
    When I attempt to create a new account without providing a name
    Then I should see a validation error "Account name is required"
    And the account should not be created

  @positive
  Scenario Outline: Create accounts with different currencies
    When I create a new account with:
      | name        | <account_name> |
      | type        | <account_type> |
      | balance     | <balance>      |
      | currency    | <currency>     |
    Then I should see the account "<account_name>" in my accounts list
    And the account should display the balance in "<currency>"

    Examples:
      | account_name    | account_type | balance | currency |
      | Euro Savings    | Savings      | 3000    | EUR      |
      | Pound Sterling  | Checking     | 2500    | GBP      |
      | Japanese Yen   | Investment   | 500000  | JPY      |

  @positive
  Scenario: Create account with zero balance
    When I create a new account with:
      | name        | New Credit Card |
      | type        | Credit Card     |
      | balance     | 0               |
      | currency    | USD             |
    Then I should see the account "New Credit Card" in my accounts list
    And the account should have a balance of "$0.00"

  @positive
  Scenario: Create account with optional description
    When I create a new account with:
      | name        | Vacation Fund   |
      | type        | Savings         |
      | balance     | 1500            |
      | currency    | USD             |
      | description | Saving for trip |
    Then I should see the account "Vacation Fund" in my accounts list
    And the account description should be "Saving for trip"
