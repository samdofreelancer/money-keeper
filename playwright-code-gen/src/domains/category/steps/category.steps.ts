import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on the categories page', async function () {
  this.categoriesPage.goto('/categories');
});

Given('I have no category with name {string}', async function (name: string) {
  // Check if category exists via API
  const existingCategory = await this.categoryApiClient.getCategoryByName(name);
  
  // If exists, delete it via API
  if (existingCategory) {
    await this.categoryApiClient.deleteCategory(existingCategory.id);
  }
  
  // Verify category no longer exists via API
  const stillExists = await this.categoryApiClient.getCategoryByName(name);
  expect(stillExists, `Expected category "${name}" to be absent before creation`).toBeNull();
});

When('I create a new category with:', async function (dataTable) {
  const obj = dataTable.rowsHash() as Record<string, string>;
  const name = obj.name ?? obj.Name ?? '';
  const icon = obj.icon ?? obj.Icon ?? undefined;
  
  expect(name, 'Missing "name" in DataTable').toBeTruthy();

  const result = await this.createCategoryUseCase.run(
    { name, icon, timeoutMs: 15000 },
    {
      verify: true,
      verifier: async (n: string) => {
        return this.categoriesPage.hasCategory(n);
      },
      settleAfterMs: 100,
      verifyRetries: 6,
      verifyIntervalMs: 300
    }
  );

  expect(result.ok, result.ok ? '' : result.error).toBeTruthy();
});

Then('the category {string} should appear in the category list', async function (name: string) {
  const exists = await this.categoriesPage.hasCategory(name);
  expect(exists, `Expected category "${name}" to appear in the category list`).toBe(true);
});
