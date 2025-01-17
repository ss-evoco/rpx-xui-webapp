Feature: IA create case workflow

    Background:
        When I navigate to Expert UI Url
        Given I am logged into Expert UI with valid user details
        Then I should be redirected to EUI dashboard page
        When I click on create case button
        Then Create case page should be displayed

    Scenario: Create and Submit IA Case start appeal
        When I start case with jurisdiction "Immigration & Asylum" case type "Appeal* master" and event "Start your appeal"
        When I check all fields IAC case
        Then I am on check your answers page
        When I submit case
        Then I see case details page
