import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { poll } from 'shared/utilities/poll';
import { sanitizeCategoryData } from 'shared/utilities/data-sanitization';
import { getCategoriesPage } from 'shared/utilities/hooks';

// Configuration constants for better maintainability
const POLLING_CONFIG = {
  timeoutMs: 2000,
  intervalMs: 200,
} as const;

const ERROR_MESSAGES = {
  MISSING_NAME: 'Missing required "name" field in category creation data',
  CATEGORY_NOT_FOUND: 'Category not found in list',
  CATEGORY_STILL_EXISTS: 'Category still exists after cleanup',
} as const;

Given('I am on the categories page', async function () {
  const categoriesPage = getCategoriesPage();
  await categoriesPage.goto('/categories');
});

Given('I have no category with name {string}', async function (name: string) {
  // Idempotent cleanup: delete all categories with this name
  const categoriesToDelete = await this.categoryApiClient.findByName(name);

  for (const category of categoriesToDelete) {
    await this.categoryApiClient.deleteCategory(category.id);
  }

  // Retry/poll to handle eventual consistency
  await poll(async () => {
    const remainingCategories = await this.categoryApiClient.findByName(name);
    return remainingCategories.length === 0;
  }, POLLING_CONFIG);
});

When('I create a new category with:', async function (dataTable) {
  const row = dataTable.rowsHash() as Record<string, string>;
  const { name, icon } = sanitizeCategoryData(row);

  if (!name) {
    throw new Error(ERROR_MESSAGES.MISSING_NAME);
  }

  const result = await this.createCategoryUseCase.run(
    { name, icon },
    { verify: true }
  );

  expect(result.ok).toBe(true);
});

Then(
  'the category {string} should appear in the category list',
  async function (name: string) {
    const categoryExists = await this.categoriesPage.hasCategory(name);
    expect(
      categoryExists,
      `${ERROR_MESSAGES.CATEGORY_NOT_FOUND}: ${name}`
    ).toBe(true);
  }
);

Then(
  'the category {string} should not appear in the category list',
  async function (name: string) {
    const categoryExists = await this.categoriesPage.hasCategory(name);
    expect(
      categoryExists,
      `${ERROR_MESSAGES.CATEGORY_STILL_EXISTS}: ${name}`
    ).toBe(false);
  }
);
