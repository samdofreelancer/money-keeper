Feature: Category management

  Scenario: Load all categories
    Given I open the homepage
    When I navigate to the Categories page
    Then I should see a list of categories

  Scenario Outline: Create a new category
    Given I open the homepage
    When I navigate to the Categories page
    And I open the create category dialog
    And I fill in the category form with valid data "<categoryName>", "<icon>", "<categoryType>", "<parentCategory>"
    And I submit the category form
    Then I should see the new category in the list "<categoryName>"

    Examples:
      | categoryName   | icon          | categoryType | parentCategory |
      | Test Category  | Grid          | EXPENSE      | None           |
      | Sample Category| Shopping      | INCOME       | None           |

  Scenario Outline: Edit an existing category
    Given a "Sample Category" category exists
    And I open the homepage
    When I navigate to the Categories page
    And I open the edit category dialog for "Sample Category"
    And I fill in the category form with valid data "<newCategoryName>", "<icon>", "<categoryType>", "<parentCategory>"
    And I submit the category form
    Then I should see the updated category in the list "<newCategoryName>"

    Examples:
      | newCategoryName  | icon | categoryType | parentCategory |
      | Updated Category | Food | EXPENSE      | None           |

  Scenario: Delete a category
    Given a "Test Category" category exists
    And I open the homepage
    When I navigate to the Categories page
    And I open the delete category dialog for "Test Category"
    And I confirm the delete action
    Then I should not see category "Test Category" in the list

  Scenario Outline: Search categories
    Given a "Test Category" category exists
    And a "Sample Category" category exists
    And I open the homepage
    When I navigate to the Categories page
    And I search categories with query "<searchQuery>"
    Then I should see category "<expectedCategory>" in the list
    And I should not see category "<unexpectedCategory>" in the list

    Examples:
      | searchQuery | expectedCategory | unexpectedCategory |
      | Test       | Test Category    | Sample Category    |
      | Sample     | Sample Category  | Test Category      |

  Scenario Outline: Filter categories by tab
    Given a "Test Category" category of type "EXPENSE" exists
    And a "Sample Category" category of type "INCOME" exists
    And I open the homepage
    When I navigate to the Categories page
    And I filter categories by tab "<tabName>"
    Then I should see category "<expectedCategory>" in the list
    And I should not see category "<unexpectedCategory>" in the list

    Examples:
      | tabName | expectedCategory | unexpectedCategory |
      | Expense | Test Category    | Sample Category    |
      | Income  | Sample Category  | Test Category      |

  Scenario Outline: Validation errors on create/edit category
    Given I open the homepage
    When I navigate to the Categories page
    And I open the create category dialog
    And I fill in the category form with valid data "<categoryName>", "<icon>", "<categoryType>", "<parentCategory>"
    And I clear the category name field
    And I click the submit button
    Then I should see a validation error message "Please input category name"

    Examples:
      | categoryName  | icon     | categoryType | parentCategory |
      | Invalid Cat   | Grid     | EXPENSE      | None           |
