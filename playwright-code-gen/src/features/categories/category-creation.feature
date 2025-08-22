Feature: Category Management
  As a user
  I want to manage categories
  So that I can organize my expenses and income

  Background:
    Given I am on the categories page

  Scenario: Create a category without parent successfully
    Given I have no category with name "Food_Test"
    When I create a new category with:
      | name | Food_Test |
      | icon | Grid      |
      | type | Expense   |
    Then the category "Food_Test" should appear in the category list
