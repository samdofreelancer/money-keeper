@accounts @account-management @regression
Feature: Account Management
  As a money management user
  I want to manage my existing accounts
  So that I can keep my financial information up to date

  Background:
    Given I am logged into the money management system
    And I have an existing account named "Main Checking"
    And the account should have a balance of "$1,000.00"

  @positive
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

  @positive @wip
  Scenario: Search and filter accounts
    Given I have the following accounts:
      | name           | type         | balance | currency |
      | Savings        | Bank Account | 5000    | USD      |
      | Credit Card    | Credit Card  | -500    | USD      |
      | Cash Wallet    | Cash         | 200     | USD      |
    When I search for accounts containing "Sav"
    Then I should only see accounts with names containing "Sav"
    When I filter accounts by type "Credit Card"
    Then I should only see accounts of type "Credit Card"

  @positive @wip
  Scenario: Sort accounts by balance
    Given I have multiple accounts with different balances
    When I click the "Balance" column header
    Then the accounts should be sorted by balance in descending order
    When I click the "Balance" column header again
    Then the accounts should be sorted by balance in ascending order

  @negative @wip
  Scenario: Attempt to delete account with transactions
    Given the account "Main Checking" has existing transactions
    When I attempt to delete the account
    Then I should see an error message "Cannot delete account with existing transactions"
    And the account "Main Checking" should still exist
