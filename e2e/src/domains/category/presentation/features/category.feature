@category-management
Feature: Category Management for Personal Finance Tracking

  As a user managing my personal finances
  I want to organize my income and expenses into categories
  So that I can track and analyze my spending patterns effectively

  Background:
    Given I am on the Money Keeper application
    And I have access to the category management features

  @smoke @critical
  Scenario Outline: User can create new categories for expense tracking
    When I want to create a new "<categoryType>" category called "<categoryName>"
    And I assign it the "<icon>" icon
    Then the category "<categoryName>" should be available for use
    And I should be able to see it in my category list

    Examples:
      | categoryName     | icon     | categoryType |
      | Groceries        | Grid     | EXPENSE      |
      | Salary Income    | Shopping | INCOME       |
      | Transportation   | Grid     | EXPENSE      |

  @regression
  Scenario Outline: User can modify existing categories
    Given I have an existing category called "<originalName>"
    When I want to rename it to "<newName>"
    And I change its icon to "<newIcon>"
    Then the category should be updated with the new name "<newName>"
    And it should display the new icon

    Examples:
      | originalName    | newName           | newIcon |
      | Sample Category | Updated Category  | Food    |

  @smoke @critical
  Scenario: User can remove categories they no longer need
    Given I have a category called "Unused Category"
    When I decide to delete this category
    And I confirm the deletion
    Then the category "Unused Category" should no longer appear in my list

  @regression
  Scenario Outline: User can quickly find categories using search
    Given I have multiple categories including "<category1>" and "<category2>"
    When I search for "<searchTerm>"
    Then I should see "<expectedCategory>" in the results
    But I should not see "<unexpectedCategory>" in the results

    Examples:
      | category1       | category2       | searchTerm | expectedCategory | unexpectedCategory |
      | Test Category   | Sample Category | Test       | Test Category    | Sample Category    |
      | Test Category   | Sample Category | Sample     | Sample Category  | Test Category      |

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

  @validation @critical
  Scenario: System prevents creation of categories without required information
    When I try to create a category without providing a name
    Then I should see an error message "Please input category name"
    And the category should not be created

  @validation @critical
  Scenario: System prevents duplicate category names
    Given I already have a category called "Existing Category"
    When I try to create another category with the same name "Existing Category"
    Then I should see an error message "Category name already exists"
    And the duplicate category should not be created

  @usability
  Scenario: User can cancel category creation without saving changes
    When I start creating a new category called "Temporary Category"
    But I decide to cancel the operation
    Then the category "Temporary Category" should not be created
    And I should return to the category list

  @usability
  Scenario: User can cancel category editing without saving changes
    Given I have a category called "Sample Category"
    When I start editing it to change the name to "Edited Category"
    But I decide to cancel the changes
    Then the category should remain as "Sample Category"
    And the changes should not be saved

  @usability
  Scenario: User can cancel category deletion
    Given I have a category called "Test Category"
    When I initiate the deletion process
    But I decide to cancel the deletion
    Then the category "Test Category" should remain in my list

  @validation
  Scenario: System prevents editing category to have duplicate name
    Given I have categories called "Test Category" and "Sample Category"
    When I try to rename "Sample Category" to "Test Category"
    Then I should see an error message "Category name already exists"
    And the category name should not be changed
