@accounts @account-creation @negative
Feature: Account Creation Validation
  As a money management user
  I want to be prevented from creating invalid accounts
  So that my account data remains correct

  Background:
    Given I am logged into the money management system

  Scenario: Show error when creating account with zero balance
    When I create a new account with:
      | name        | zero bank account |
      | type        | Bank Account      |
      | balance     | 0                 |
      | currency    | USD               |
      | description |                   |
    Then I should see the error message "Balance must be greater than 0"
