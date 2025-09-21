Feature: User Registration
  As a new user
  I want to register for an account
  So that I can use the application

  Scenario: Successful registration
    Given I am on the registration page
    When I enter my username "testuser"
    And I enter my password "password"
    And I confirm my password "password"
    And I click the "Register" button
    Then I should be redirected to the login page
