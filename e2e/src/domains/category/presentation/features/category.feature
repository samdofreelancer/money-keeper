Feature: Category Management

  As a user
  I want to manage categories for my transactions
  So that I can organize my expenses and income efficiently

  Background:
    Given the system has no categories

  Scenario: Create a new category
    When I create a category with name "Food", icon "🍔", type "expense"
    Then the category "Food" should be created successfully

  Scenario: Create a category with a parent
    Given a category "Utilities" with icon "💡" and type "expense" exists
    When I create a category with name "Electricity", icon "🔌", type "expense", and parent "Utilities"
    Then the category "Electricity" should be created as a child of "Utilities"

  Scenario: Prevent duplicate category names
    Given a category "Transport" with icon "🚗" and type "expense" exists
    When I create another category with name "Transport", icon "🚌", type "expense"
    Then the category creation should fail with error "Category name must be unique"

  Scenario: Prevent cyclic parent relationships
    Given a category "A" with icon "A" and type "expense" exists
    And a category "B" with icon "B" and type "expense" and parent "A" exists
    When I update category "A" to have parent "B"
    Then the update should fail with error "Cyclic parent relationship is not allowed"

  Scenario: Field value length validation
    When I create a category with a name longer than the maximum allowed length
    Then the category creation should fail with error "Category name exceeds maximum length"

  Scenario: Prevent deletion of category with children
    Given a category "Parent" with icon "P" and type "expense" exists
    And a category "Child" with icon "C" and type "expense" and parent "Parent" exists
    When I delete the category "Parent"
    Then the deletion should fail with error "Cannot delete category with child categories"

  Scenario: Validate category type
    When I create a category with name "Gift", icon "🎁", and type "invalid-type"
    Then the category creation should fail with error "Category type must be expense or income"

  Scenario: List categories
    Given categories "Groceries", "Salary", and "Rent" exist
    When I list all categories
    Then I should see "Groceries", "Salary", and "Rent" in the