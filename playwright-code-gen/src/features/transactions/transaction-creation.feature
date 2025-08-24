# Transaction Creation Tests

@wip @ignore
Feature: Transaction Creation
  As a user
  I want to create new transactions
  So that I can track my income and expenses

  Background:
    Given I am logged into the money management system
    And I have access to the transactions management section

  Scenario: Successfully create a new expense transaction
    When I create a new transaction with:
      | description | Grocery Shopping    |
      | amount     | 100                 |
      | type       | EXPENSE             |
      | account    | My Savings Account  |
      | category   | Food                |
      | date       | 2025-08-23         |
      | notes      | Weekly groceries    |
    Then I should see the transaction "Grocery Shopping" in my transactions list
    And the transaction details should match:
      | amount  | -$100.00           |
      | type    | Expense            |
      | account | My Savings Account |
      | category| Food               |

  Scenario: Attempt to create a transaction with invalid amount
    When I attempt to create a transaction with:
      | description | Invalid Amount    |
      | amount     | -50               |
      | type       | INCOME            |
      | account    | Checking Account  |
    Then I should see an error message "Amount must be positive"
    And the transaction should not be created

  Scenario: Create a transaction without optional fields
    When I create a new transaction with:
      | description | Salary      |
      | amount     | 5000        |
      | type       | INCOME      |
    Then I should see the transaction "Salary" in my transactions list
    And the transaction amount should be "$5,000.00"
