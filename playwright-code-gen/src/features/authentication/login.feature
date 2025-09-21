Feature: User Login
  As a registered user
  I want to log in to the application
  So that I can access my account

  Scenario: Successful login
    Given I am on the login page
    When I enter my username "testuser"
    And I enter my password "password"
    And I click the "Login" button
    Then I should be redirected to the dashboard
