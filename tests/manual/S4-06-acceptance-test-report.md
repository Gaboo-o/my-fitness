S4-06: Manual End-to-End Browser Acceptance Test Report

Project: MyFitness
Sprint: Sprint 4
Task ID: S4-06
Testing Date: November 15, 2026
Browser: Brave
Platform: Desktop PC
Branch: feature/sprint4-browser-acceptance

1. Objective

The objective of this task is to perform manual end-to-end browser acceptance testing of the MyFitness application. Testing focuses on verifying that exercise selection, workout timers, user profiles, workout history, progress tracking, milestones, and desktop navigation function correctly.

2. Test Environment

Operating System: Windows

Browser: Brave

Application: MyFitness

Backend: Python Flask

Frontend: HTML, CSS, JavaScript

Testing Method: Manual browser testing

3. Test Case Summary

Test ID

Feature

Status

TC-01

Exercise Selection and Custom Workout

PASS

TC-02

Workout Interval Timer

PASS

TC-03

User Profile

PASS

TC-04

Workout History

PASS

TC-05

Progress Tracking

PASS

TC-06

Personal Workout Milestones

PASS

TC-07

Desktop Page Navigation

PASS

Total Test Scenarios: 7
Passed: 7
Failed: 0

4. Detailed Test Cases

TC-01: Exercise Selection and Custom Workout

Objective: Verify that users can filter, select, and complete exercises.

Test Steps:

Navigate to the Workouts page.

Select Strength as the workout type.

Select Home as the workout location.

Click Load Exercises.

Select Push-Ups, Squats, and Plank.

Click Use Selected Exercises.

Mark the exercises as completed.

Expected Result: The selected exercises should appear correctly, and the application should save the completed workout.

Actual Result: All three exercises appeared with their corresponding information, and the application displayed "Workout saved successfully."

Status: PASS

TC-02: Workout Interval Timer

Objective: Verify that the workout timer operates correctly.

Test Steps:

Set the workout interval to 10 seconds.

Set the rest interval to 5 seconds.

Start the timer.

Pause the timer.

Resume the timer.

Reset the timer.

Verify the transition from Work to Rest.

Expected Result: The timer should support countdown, pause, resume, reset, and work-to-rest transitions.

Actual Result: All tested timer controls functioned correctly. The timer resumed from the paused value and successfully transitioned to the rest interval.

Status: PASS

TC-03: User Profile

Objective: Verify that profile information can be updated and saved.

Test Steps:

Navigate to the Profile page.

Update the fitness goal to Build Muscle.

Save the profile.

Refresh the browser.

Verify that the updated information remains visible.

Expected Result: Profile changes should be saved and remain available after refreshing.

Actual Result: The updated fitness goal remained displayed.

Status: PASS

TC-04: Workout History

Objective: Verify that completed workouts are recorded correctly.

Test Steps:

Complete a custom workout.

Navigate to Workout History.

Locate the newly saved workout.

Verify the date, workout type, location, and exercise names.

Expected Result: Completed workouts should appear in history with the correct details.

Actual Result: The workout completed on November 15, 2026, appeared with Push-Ups, Squats, and Plank.

Status: PASS

TC-05: Progress Tracking

Objective: Verify that workout completion updates progress statistics.

Test Steps:

Record the existing workout statistics.

Complete and save a workout.

Navigate to the Progress page.

Compare the updated statistics.

Expected Result: Workout totals, streaks, and activity information should update after completing a workout.

Actual Result:

Weekly workouts increased from 0 to 1.

Monthly workouts increased from 1 to 2.

Total completed workouts increased from 6 to 7.

Current streak increased from 0 to 1 day.

The activity chart reflected the completed workout.

Status: PASS

TC-06: Personal Workout Milestones

Objective: Verify milestone creation, progress tracking, and deletion.

Test Steps:

Navigate to the Milestones section.

Update an existing milestone.

Verify the calculated progress percentage.

Create a new automatic workout milestone.

Verify that the milestone reflects existing workout history.

Delete a test milestone.

Verify that the deleted milestone no longer appears.

Expected Result: Milestones should support creation, updating, automatic progress calculations, and deletion.

Actual Result: Milestone progress calculations were correct. Automatic milestones reflected the existing workout count, and deletion worked successfully.

Status: PASS

TC-07: Desktop Page Navigation

Objective: Verify that the main pages load and display correctly on desktop.

Test Steps:

Navigate to Dashboard.

Navigate to Workouts.

Navigate to Exercises.

Navigate to Progress.

Navigate to Milestones and Workout History.

Navigate to Profile.

Return to Dashboard.

Expected Result: All pages should load successfully and display their content without visible layout problems.

Actual Result: All tested pages loaded and displayed their main content correctly in the desktop browser.

Status: PASS

5. Observations and Limitations

Automatic workout milestones include previously completed workouts when calculating progress.

Desktop browser functionality was tested successfully.

Mobile and tablet responsiveness were not tested because the current application is designed for desktop use.

Browser Back/Forward behavior was not independently verified.

Comprehensive invalid-input and cross-browser testing were not performed.

No blocking errors were observed in the tested workflows.

6. Conclusion

Manual end-to-end browser acceptance testing was completed for the seven primary desktop test scenarios.

All seven documented scenarios passed. Exercise selection, workout timer controls, profile updates, workout history, progress tracking, milestone management, and desktop page navigation functioned as expected during testing.

The MyFitness application passed the documented desktop acceptance checks. Additional testing may be required if responsive design, cross-browser compatibility, or advanced edge-case handling becomes part of the project requirements.
