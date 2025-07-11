@category-basic-test
Feature: Basic Category Test

  Background:
    Given I am on the Money Keeper application
    And I have access to the category management features

  @smoke
  Scenario: Simple category creation test
    When I navigate to the Categories page
    And I open the create category dialog
    And I fill in the category form with valid data "Test Category", "Grid", "EXPENSE", "None"
    And I submit the category form
    Then I should see the new category in the list "Test Category"
    