@accounts @account-creation @regression
Feature: Account Creation
  As a money management user
  I want to create new financial accounts
  So that I can track my income and expenses across different accounts

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
    #Then I should see an error message "Account name already exists"
    Then the account "Main Checking" should appear only once in my accounts list
