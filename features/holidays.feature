Feature: Holidays Creation

  Background:
    Given I am logged in as the admin

  @smoke @regression
  Scenario: Create a shift-based holiday that repeats
    When I open the "Leave Management" module
    And I create a "General" holiday named "New Year {unique}" on "today+7"
    And I link the holiday to "Shift"
    And I select the shifts "Week Off, Azure"
    And I set the holiday to repeat 5 times
    And I submit and confirm
    Then the holiday "New Year {unique}" should be created

  @negative @regression
  Scenario: Holiday date older than 90 days is not allowed
    When I open the "Leave Management" module
    And I start creating a holiday named "Old Holiday"
    Then the date "today-100" should be disabled