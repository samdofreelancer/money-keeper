import { Given, When, Then, After } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { poll } from 'shared/utilities/poll';
import { sanitizeCategoryData } from 'shared/utilities/data-sanitization';
import { getCategoriesPage } from 'shared/utilities/hooks';
import { TestData } from 'shared/utilities/testData';
import { CategoryType } from 'category-domain/types/category-type';

// Configuration constants for better maintainability
const POLLING_CONFIG = {
  timeoutMs: 5000,
  intervalMs: 200,
} as const;

const ERROR_MESSAGES = {
  MISSING_NAME: 'Missing required "name" field in category creation data',
  CATEGORY_NOT_FOUND: 'Category not found in list',
  CATEGORY_STILL_EXISTS: 'Category still exists after cleanup',
  PARENT_NOT_LOADED: 'Parent category not loaded on frontend',
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

When('I create a parent category {string} via backend API', async function (name: string) {
  const categoryData = {
    name,
    icon: 'Grid',
    type: CategoryType.EXPENSE,
    parentId: null,
  };

  const createdCategory = await this.categoryApiClient.createCategory(categoryData);

  // Track for cleanup
  TestData.trackCreatedCategory(createdCategory.name);

  // Store parent category for later use
  this.parentCategory = createdCategory;
});

Then('the parent category {string} should be loaded on the frontend', async function (name: string) {
  const categoriesPage = getCategoriesPage();

  // Navigate to categories page if not already there
  await categoriesPage.goto('/categories');

  // Poll to ensure the category appears on the frontend
  await poll(async () => {
    return await categoriesPage.hasCategory(name);
  }, POLLING_CONFIG);
});

When('I create a child category {string} under parent {string}', async function (childName: string, parentName: string) {
  // Find the parent category by name to get its ID
  const parentCategories = await this.categoryApiClient.findByName(parentName);
  if (parentCategories.length === 0) {
    throw new Error(`Parent category "${parentName}" not found`);
  }
  const parentId = parentCategories[0].name;

  const result = await this.createCategoryUseCase.run(
    {
      name: childName,
      icon: 'Shopping',
      parentName: parentName,
    },
    { verify: true }
  );

  expect(result.ok).toBe(true);

  // Store child category for potential future use
  this.childCategory = result.createdName;
});

Then('the child category {string} should appear under parent {string}', async function (childName: string, parentName: string) {
  const categoriesPage = getCategoriesPage();

  // Verify child category exists
  const childExists = await categoriesPage.hasCategory(childName);
  expect(childExists, `${ERROR_MESSAGES.CATEGORY_NOT_FOUND}: ${childName}`).toBe(true);

  // Verify parent category still exists
  const parentExists = await categoriesPage.hasCategory(parentName);
  expect(parentExists, `${ERROR_MESSAGES.CATEGORY_NOT_FOUND}: ${parentName}`).toBe(true);
});
