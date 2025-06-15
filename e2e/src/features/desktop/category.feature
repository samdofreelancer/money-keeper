Feature: Category management

  Scenario: Load all categories
    Given I open the homepage
    When I navigate to the Categories page
    Then I should see a list of categories

  Scenario: Create a new category
    Given I open the homepage
    When I navigate to the Categories page
    And I open the create category dialog
    And I fill in the category form with valid data
    And I submit the category form
    Then I should see the new category in the list
