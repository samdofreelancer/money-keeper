@category-search-filter
Feature: Category Search and Filtering

  As a user with many categories
  I want to search and filter my categories
  So that I can quickly find the categories I need

  Background:
    Given I am on the Money Keeper application
    And I have access to the category management features

  @regression
  Scenario Outline: User can quickly find categories using search
    Given I have multiple categories including "<category1>" and "<category2>"
    When I search for "<searchTerm>"
    Then I should see "<expectedCategory>" in the results
    But I should not see "<unexpectedCategory>" in the results

    Examples:
      | category1       | category2       | searchTerm | expectedCategory | unexpectedCategory |
      | Groceries       | Transportation  | Grocer     | Groceries        | Transportation     |
      | Salary Income   | Freelance Income| Salary     | Salary Income    | Freelance Income   |
      | Entertainment   | Utilities       | Enter      | Entertainment    | Utilities          |

  @regression
  Scenario Outline: User can filter categories by income and expense types
    Given I have both income and expense categories
    When I filter by "<filterType>" categories
    Then I should only see categories of type "<filterType>"
    And categories of other types should be hidden

    Examples:
      | filterType |
      | Expense    |
      | Income     |

  @regression
  Scenario: User can clear search to see all categories
    Given I have multiple categories
    And I have searched for a specific category
    When I clear the search filter
    Then I should see all my categories again

  @regression
  Scenario: User can combine search and filter
    Given I have multiple income and expense categories
    When I filter by "Expense" categories
    And I search for "Food"
    Then I should only see expense categories containing "Food"
    And income categories should not appear

  @performance
  Scenario: Search works efficiently with large number of categories
    Given I have created 100 categories
    When I search for a specific category
    Then the search results should appear quickly
    And the system should remain responsive
