@category-validation
Feature: Category Validation and Error Handling

  As a user managing my personal finances
  I want the system to validate my category inputs
  So that I can maintain data integrity and avoid errors

  Background:
    Given I am on the Money Keeper application
    And I have access to the category management features

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

  @validation
  Scenario: System prevents editing category to have duplicate name
    Given I have categories called "Test Category" and "Sample Category"
    When I try to rename "Sample Category" to "Test Category"
    Then I should see an error message "Category name already exists"
    And the category name should not be changed

  @validation
  Scenario: System validates category name length
    When I try to create a category with a very long name exceeding 100 characters
    Then I should see an error message about maximum length
    And the category should not be created

  @validation
  Scenario: System validates special characters in category names
    When I try to create a category with name containing "<script>" characters
    Then I should see an error message "Category name contains invalid characters"
    And the category should not be created
