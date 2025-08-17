import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on the categories page', async function () {
  await this.categoriesPage.goto('/categories');
});

Given('I have no category with name {string}', async function (name: string) {
  const existing = await this.categoryApiClient.getCategoryByName(name);
  if (existing) await this.categoryApiClient.deleteCategory(existing.id);
  const still = await this.categoryApiClient.getCategoryByName(name);
  expect(still).toBeNull();
});

When('I create a new category with:', async function (dataTable) {
  const row = dataTable.rowsHash() as Record<string, string>;
  const name = row.name ?? row.Name ?? '';
  const icon = row.icon ?? row.Icon ?? undefined;
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
