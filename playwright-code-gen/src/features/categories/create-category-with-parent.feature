Feature: Category Management with Parent-Child Relationship
  As a user
  I want to manage categories with parent-child relationships
  So that I can organize my expenses and income hierarchically

  Background:
    Given I am on the categories page

  @focus
  Scenario: Create parent category via API and child category via UI
    Given I have no category with name "Parent_Test"
    And I have no category with name "Child_Test"
    When I create a parent category "Parent_Test" via backend API
    Then the parent category "Parent_Test" should be loaded on the frontend
    When I create a child category "Child_Test" under parent "Parent_Test"
    Then the child category "Child_Test" should appear under parent "Parent_Test"

