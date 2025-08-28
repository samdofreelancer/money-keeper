@accounts @account-creation @positive
Feature: Account Creation with Non-default Currency
  As a money management user
  I want to create a bank account with a currency other than USD
  So that I can track balances in different currencies

  Background:
    Given I am logged into the money management system

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
