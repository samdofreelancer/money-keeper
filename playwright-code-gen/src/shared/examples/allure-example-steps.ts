import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import {
  description,
  severity,
  epic,
  feature,
  story,
  screenshot,
  json,
  text,
  environment,
  AllureAnnotations,
} from '../utilities/allure-annotations';

const { step } = AllureAnnotations;

// Example step definitions with Allure annotations

Before(async function () {
  // Add environment information for all tests
  environment('Browser', process.env.BROWSER || 'chromium');
  environment('Test Environment', process.env.NODE_ENV || 'development');
  environment('Parallel Workers', process.env.CUCUMBER_PARALLEL_WORKERS || '1');
});

Given('I am on the login page', async function () {
  // Add test metadata
  description(
    'User navigates to the login page to begin authentication process'
  );
  severity('critical');
  epic('Authentication');
  feature('User Login');
  story('Successful Login Flow');

  await step('Navigate to login page', async () => {
    await this.page.goto('/login');
  });

  await step('Verify login page is loaded', async () => {
    await this.page.waitForSelector('#login-form');
  });
});

When('I fill in valid credentials', async function () {
  // Add test data as JSON attachment
  const credentials = {
    username: 'testuser@example.com',
    password: 'securepassword123',
  };

  json('Login Credentials', credentials);

  await step('Enter username', async () => {
    await this.page.fill('#username', credentials.username);
  });

  await step('Enter password', async () => {
    await this.page.fill('#password', credentials.password);
  });

  // Take screenshot of filled form
  const screenshotBuffer = await this.page.screenshot();
  screenshot('Login Form Filled', screenshotBuffer);
});

When('I click the login button', async function () {
  await step('Click login button', async () => {
    await this.page.click('#login-button');
  });
});

Then('I should be redirected to the dashboard', async function () {
  await step('Wait for navigation', async () => {
    await this.page.waitForURL('**/dashboard');
  });

  await step('Verify dashboard elements', async () => {
    await this.page.waitForSelector('.dashboard-header');
    await this.page.waitForSelector('.dashboard-content');
  });

  // Take screenshot of successful login
  const screenshotBuffer = await this.page.screenshot();
  screenshot('Dashboard After Login', screenshotBuffer);
});

Then('I should see my user information', async function () {
  await step('Check user information display', async () => {
    const userInfo = await this.page.textContent('.user-info');
    expect(userInfo).toContain('Welcome, testuser');
  });

  // Add user info as text attachment
  const userInfoText = await this.page.textContent('.user-info');
  text('User Information Displayed', userInfoText || 'No user info found');
});

// Example of error handling with Allure
When('I fill in invalid credentials', async function () {
  const invalidCredentials = {
    username: 'invalid@example.com',
    password: 'wrongpassword',
  };

  json('Invalid Login Credentials', invalidCredentials);

  await this.page.fill('#username', invalidCredentials.username);
  await this.page.fill('#password', invalidCredentials.password);
});

Then('I should see an error message', async function () {
  try {
    await step('Wait for error message', async () => {
      await this.page.waitForSelector('.error-message', { timeout: 5000 });
    });

    await step('Verify error message content', async () => {
      const errorText = await this.page.textContent('.error-message');
      expect(errorText).toContain('Invalid credentials');
    });

    // Capture error state screenshot
    const screenshotBuffer = await this.page.screenshot();
    screenshot('Error Message Displayed', screenshotBuffer);
  } catch (error) {
    // Capture screenshot on error
    const screenshotBuffer = await this.page.screenshot();
    screenshot('Error State Screenshot', screenshotBuffer);

    // Add error details
    text('Error Details', (error as Error).message);

    throw error;
  }
});

// Example of complex workflow with multiple steps
Given('I am a registered user', async function () {
  description('Setup scenario for registered user actions');
  severity('normal');
  epic('User Management');
  feature('User Profile');
  story('Profile Management');

  await step('Navigate to registration page', async () => {
    await this.page.goto('/register');
  });

  await step('Fill registration form', async () => {
    await this.page.fill('#name', 'John Doe');
    await this.page.fill('#email', 'john.doe@example.com');
    await this.page.fill('#password', 'securepass123');
  });

  await step('Submit registration', async () => {
    await this.page.click('#register-button');
    await this.page.waitForURL('**/dashboard');
  });
});

When('I update my profile information', async function () {
  const profileData = {
    name: 'John Smith',
    bio: 'Software Engineer',
    location: 'New York',
  };

  json('Profile Update Data', profileData);

  await step('Navigate to profile page', async () => {
    await this.page.goto('/profile');
  });

  await step('Update profile fields', async () => {
    await this.page.fill('#name', profileData.name);
    await this.page.fill('#bio', profileData.bio);
    await this.page.fill('#location', profileData.location);
  });

  await step('Save profile changes', async () => {
    await this.page.click('#save-profile');
  });
});

Then('my profile should be updated successfully', async function () {
  await step('Verify profile update', async () => {
    await this.page.waitForSelector('.success-message');
    const successMessage = await this.page.textContent('.success-message');
    expect(successMessage).toContain('Profile updated successfully');
  });

  // Capture final state
  const screenshotBuffer = await this.page.screenshot();
  screenshot('Profile Updated Successfully', screenshotBuffer);
});
