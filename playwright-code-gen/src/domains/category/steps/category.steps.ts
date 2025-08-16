import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CategoryUseCase } from '../usecases/category.use-case';
import { CategoryApiClient } from '../api/category-api.client';

let categoryUseCase: CategoryUseCase;
let categoryApiClient: CategoryApiClient;

Given('I am on the categories page', async function () {
  categoryUseCase = new CategoryUseCase(this.page);
  categoryApiClient = new CategoryApiClient(this.page.request);
  await categoryUseCase.categoriesPage.goto();
});

Given('I have no category with name {string}', async function (categoryName: string) {
  await categoryUseCase.deleteCategoryIfExists(categoryName);
});

When('I create a new category with:', async function (dataTable) {
  const data = dataTable.rowsHash();
  await categoryUseCase.createCategoryWithoutParent({
    name: data.name,
    icon: data.icon,
    type: data.type as 'Expense' | 'Income'
  });
});

Then('the category {string} should appear in the category tree', async function (categoryName: string) {
  await categoryUseCase.waitForCategoryTreeToLoad();
  const exists = await categoryUseCase.categoryExists(categoryName);
  expect(exists).toBe(true);
});

Then('the category tree should not show {string}', async function (text: string) {
  await expect(this.page.getByTestId('category-tree')).not.toContainText(text);
});

When('I delete the category {string}', async function (categoryName: string) {
  await categoryUseCase.categoriesPage.clickDeleteCategoryButton(categoryName);
  await categoryUseCase.categoriesPage.clickConfirmDeleteButton();
});

Then('the category {string} should no longer appear in the category tree', async function (categoryName: string) {
  const exists = await categoryUseCase.categoryNotExists(categoryName);
  expect(exists).toBe(true);
});
