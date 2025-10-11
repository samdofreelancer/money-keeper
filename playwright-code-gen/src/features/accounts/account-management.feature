@accounts @account-management @regression
Feature: Account Management
  As a money management user
  I want to manage my existing accounts
  So that I can keep my financial information up to date

  Background:
    Given I am logged into the money management system
    And I have an existing account named "Main Checking"
    And the account should have a balance of "$1,000.00"

  @positive @update
  Scenario: Successfully edit account details
    When I edit the account "Main Checking" with:
      | name        | Updated Checking |
      | type        | Bank Account     |
      | balance     | 2000            |
      | currency    | USD             |
      | description | Updated account  |
    Then the account "Updated Checking" should have a balance of "$2,000.00"

  @positive @wip
  Scenario: Successfully deactivate account
    When I deactivate the account "Main Checking"
    Then the account should be marked as inactive
    And the account balance should not be included in total balance

  @positive @search
  Scenario Outline: Search accounts by name substring
    Given I have the following accounts:
      | name        | type         | balance | currency |
      | Savings     | Bank Account | 5000    | USD      |
      | E-Wallet    | E-Wallet     | 500     | USD      |
      | Bank Account| Bank Account | 200     | USD      |
    When I search for accounts containing "<query>"
    Then only the account "<expected>" is shown

    Examples:
      | query        | expected     |
      | Sav          | Savings      |
      | E-Wallet     | E-Wallet     |

  @positive
  Scenario: Sort accounts by balance
    Given I have multiple accounts with different balances
    When I click the "Balance" column header
    Then the accounts should be sorted by balance in "descending" order
    When I click the "Balance" column header again
    Then the accounts should be sorted by balance in "ascending" order

  @negative @wip
  Scenario: Attempt to delete account with transactions
    Given the account "Main Checking" has existing transactions
    When I attempt to delete the account
    Then I should see an error message "Cannot delete account with existing transactions"
    And the account "Main Checking" should still exist

  @positive @wip
  Scenario: Successfully delete account without transactions
    Given I have an existing account named "Temp Account"
    When I delete the account "Temp Account"
    Then the account "Temp Account" should not be in my accounts list

  @negative @wip
  Scenario: Attempt to update account to duplicate name
    Given I have accounts named "Account A" and "Account B"
    When I edit the account "Account A" with:
      | name        | Account B |
      | type        | Bank Account |
      | balance     | 2000       |
      | currency    | USD        |
      | description | Updated    |
    Then I should see an error message "Account name already exists"

  @negative @wip
  Scenario: Attempt to update account to empty name
    When I edit the account "Main Checking" with:
      | name        |  |
      | type        | Bank Account |
      | balance     | 1000         |
      | currency    | USD          |
      | description | Test         |
    Then I should see an error message "Name is required"

  @negative @wip
  Scenario: Attempt to update account to negative balance
    When I edit the account "Main Checking" with:
      | name        | Main Checking |
      | type        | Bank Account  |
      | balance     | -500          |
      | currency    | USD           |
      | description | Negative      |
    Then I should see an error message "Balance must be positive"

  @positive @wip
  Scenario: Successfully list all accounts
    Given I have multiple accounts
    When I navigate to the accounts page
    Then I should see all accounts listed

  @positive @wip
  Scenario: Sort accounts by name
    Given I have multiple accounts with different names
    When I click the "Name" column header
    Then the accounts should be sorted by name in ascending order
    When I click the "Name" column header again
    Then the accounts should be sorted by name in descending order

  @positive @wip
  Scenario: Sort accounts by type
    Given I have accounts of different types
    When I click the "Type" column header
    Then the accounts should be sorted by type in ascending order
    When I click the "Type" column header again
    Then the accounts should be sorted by type in descending order

  @positive @wip
  Scenario: View account details
    Given I have an existing account named "Detail Account"
    When I click on the account "Detail Account"
    Then I should see the account details including name, type, balance, currency, and description

  @positive @wip
  Scenario: Verify total balance calculation
    Given I have accounts with balances $1000, $500, $200
    When I view the accounts page
    Then the total balance should be "$1,700.00"
