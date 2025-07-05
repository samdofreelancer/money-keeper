Feature: Accounts Management
  As a user
  I want to manage my accounts
  So that I can add, update, delete, filter, and view accounts

  Background:
    Given I am on the Accounts page

  Scenario: Accounts page loads and displays UI elements
    Then I should see the heading "Accounts"
    And I should see the button "Add Account"
    And I should see the search box with placeholder "Search accounts..."
    And I should see the table with columns:
      | Type   |
      | Name   |
      | Balance|
      | Actions|

  Scenario: Add a new account
    When I click the button "Add Account"
    And I fill in the account form with:
      | Name   | Create Test Account |
      | Type   | E-Wallet         |
      | Balance| 1000         |
    And I submit the account form
    Then I should see "Create Test Account" in the accounts table

  Scenario: Update an existing account
    Given there is an account named "Update Test Account"
    When I click the edit button for account "Update Test Account"
    And I update the account name to "Updated Test Account"
    And I submit the account form
    Then I should see "Updated Test Account" in the accounts table
    And I should not see "Update Test Account" in the accounts table

  Scenario: Delete an account
    Given there is an account named "Updated Account"
    When I click the delete button for account "Updated Account"
    And I confirm the delete action
    Then I should not see "Updated Account" in the accounts table

  Scenario: Filter accounts by name
    Given there are accounts:
      | Name         | Type  | Balance |
      | Alpha Wallet | Cash  | 500     |
      | Beta Bank    | Bank  | 2000    |
    When I search accounts with query "Beta"
    Then I should see "Beta Bank" in the accounts table
    And I should not see "Alpha Wallet" in the accounts table
