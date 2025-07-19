Feature: Category Management

  As a user
  I want to manage categories for my transactions
  So that I can organize my expenses and income efficiently

  Background:
    Given the system has no categories
    And the user is on the Category Management page

  @focus
  Scenario: Successfully create a new category
    When I create a category with name "Food", icon "🍔", type "expense"
    Then the category "Food" should be created successfully

  Scenario: Successfully create a category as a child of another
    Given a category "Utilities" with icon "💡" and type "expense" exists
    When I create a category with name "Electricity", icon "🔌", type "expense" and parent "Utilities"
    Then the category "Electricity" should be created as a child of "Utilities"

  Scenario: Fail to create a category with a duplicate name
    Given a category "Transport" with icon "🚗" and type "expense" exists
    When I create another category with name "Transport", icon "🚌", type "expense"
    Then the category creation should fail with error "Category name must be unique"

  Scenario: Fail to update a category to create a cyclic parent relationship
    Given a category "A" with icon "A" and type "expense" exists
    And a category "B" with icon "B" and type "expense" and parent "A" exists
    When I update category "A" to have parent "B"
    Then the update should fail with error "Cyclic parent relationship is not allowed"

  Scenario: Fail to create a category with a name exceeding maximum length
    When I create a category with name "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", icon "X", type "expense"
    Then the category creation should fail with error "Category name exceeds maximum length"

  Scenario: Fail to delete a category that has children
    Given a category "Parent" with icon "P" and type "expense" exists
    And a category "Child" with icon "C" and type "expense" and parent "Parent" exists
    When I delete the category "Parent"
    Then the deletion should fail with error "Cannot delete category with child categories"

  Scenario: Fail to create a category with an invalid type
    When I create a category with name "Gift", icon "🎁", and type "invalid-type"
    Then the category creation should fail with error "Category type must be expense or income"

  Scenario: List all categories
    Given categories "Groceries", "Salary", and "Rent" exist
    When I list all categories
    Then I should see "Groceries", "Salary", and "Rent" in the category list

  Scenario: Successfully update a category's name and icon
    Given a category "Books" with icon "📚" and type "expense" exists
    When I update the category "Books" to have name "Novels" and icon "📖"
    Then the category "Novels" should be created successfully

  Scenario: Fail to create a category with an invalid icon
    When I create a category with name "InvalidIcon", icon "not-an-emoji", type "expense"
    Then the category creation should fail with error "Invalid icon format"

  Scenario: Fail to create a category with a name differing only by case
    Given a category "transport" with icon "🚗" and type "expense" exists
    When I create another category with name "Transport", icon "🚌", type "expense"
    Then the category creation should fail with error "Category name must be unique (case insensitive)"