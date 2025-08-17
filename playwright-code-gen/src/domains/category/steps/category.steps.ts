import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { poll } from '../../../shared/utilities/poll';
import { sanitizeCategoryData } from '../../../shared/utilities/data-sanitization';

Given('I am on the categories page', async function () {
  await this.categoriesPage.goto('/categories');
});

Given('I have no category with name {string}', async function (name: string) {
  // Idempotent cleanup: delete all categories with this name
  const list = await this.categoryApiClient.findByName(name);
  for (const c of list) {
    await this.categoryApiClient.deleteCategory(c.id);
  }
  
  // Retry/poll to handle eventual consistency
  await poll(async () => {
    const still = await this.categoryApiClient.findByName(name);
    return still.length === 0;
  }, { timeoutMs: 2000, intervalMs: 200 });
  
  expect(await this.categoryApiClient.findByName(name)).toHaveLength(0);
});

When('I create a new category with:', async function (dataTable) {
  const row = dataTable.rowsHash() as Record<string, string>;
  const { name, icon } = sanitizeCategoryData(row);
  expect(name, 'Missing "name" in DataTable').toBeTruthy();

  const result = await this.createCategoryUseCase.run(
    { name, icon },
    { verify: true }
  );
  expect(result.ok, result.ok ? '' : result.error).toBeTruthy();
});

Then(
  'the category {string} should appear in the category list',
  async function (name: string) {
    expect(await this.categoriesPage.hasCategory(name)).toBe(true);
  }
);

Then(
  'the category {string} should not appear in the category list',
  async function (name: string) {
    expect(await this.categoriesPage.hasCategory(name)).toBe(false);
  }
);
