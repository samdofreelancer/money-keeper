Feature: Account Creation with Duplicate Name Handling

  Scenario: Create a new account and handle duplicate account name error
    Given I am on the categories page
    When I navigate to accounts via clicking "Accounts"
    When I create a new account with the following details:
      | Name        | test          |
      | Type        | Bank Account  |
      | Balance     | 1000          |
      | Currency    | US Dollar     |
      | Description | test          |
    Then I should see a success message
    When I try to create the same account again with the following details:
      | Name        | test          |
      | Type        | Bank Account  |
      | Balance     | 1000          |
      | Currency    | US Dollar     |
      | Description | test          |
    Then I should see the error message "Account name already exists"
