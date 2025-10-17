Feature: Category creation and validation
  In order to organize my finances
  As an authenticated user
  I want to create, validate and search categories

  Background:
    Given I am on the categories page

  # Happy path: create a top-level category
  Scenario: Create a top-level category successfully
    Given I have no category with name "Food_Test_UI"
    When I open the create category dialog
    And I fill the category form with:
      | name | Food_Test_UI |
      | icon | Grid        |
      | type | Expense     |
    And I submit the create category form
    Then I should see a success message "Category created successfully"
    And the category "Food_Test_UI" should appear in the category list

  # Create a category using an existing category as parent
  Scenario: Create a category with a parent successfully
    Given a category exists with name "Parent_Category_UI"
    When I open the create category dialog
    And I fill the category form with:
      | name   | Child_of_Parent_UI |
      | icon   | Shopping           |
      | type   | Expense            |
      | parent | Parent_Category_UI |
    And I submit the create category form
    Then I should see a success message "Category created successfully"
    And the category "Child_of_Parent_UI" should appear under "Parent_Category_UI"

  # Validation: required fields
  Scenario: Show validation errors when required fields are missing
    When I open the create category dialog
    And I clear the category name field
    And I submit the create category form
    Then I should see a validation error for the name field

  # Validation: duplicate name not allowed
  Scenario: Prevent creating a category with a duplicate name
    Given a category exists with name "Duplicate_UI"
    When I open the create category dialog
    And I fill the category form with:
      | name | Duplicate_UI |
      | icon | Food         |
      | type | Expense      |
    And I submit the create category form
    Then I should see an error indicating the category name already exists

  # Cancel flow: closing dialog should not create category
  Scenario: Cancel creating a category
    When I open the create category dialog
    And I fill the category form with:
      | name | Temp_Cancel_UI |
      | icon | Bills          |
      | type | Income         |
    And I cancel the create category form
    Then the category "Temp_Cancel_UI" should not appear in the category list

  # Search: find created category using search box
  Scenario: Search for a created category
    Given a category exists with name "Searchable_UI"
    When I search for "Searchable_UI"
    Then I should see the category "Searchable_UI" in the results

