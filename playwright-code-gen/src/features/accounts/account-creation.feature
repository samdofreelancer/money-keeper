Feature: Account Creation

  As a user
  I want to create a new account
  So that I can manage my finances

  Scenario: Create a new bank account
    Given I am on the accounts page
    When I click on the "Add Account" button
    And I fill in the account form with the following details:
      | Field       | Value                    |
      | Name        | Test Account             |
      | Type        | Bank Account             |
      | Balance     | 1000                     |
      | Currency    | US Dollar                |
      | Description | Test account description |
    And I click on the "Create" button
    Then I should see the account "Test Account" in the accounts list
    And the total balance should include $1,000.00