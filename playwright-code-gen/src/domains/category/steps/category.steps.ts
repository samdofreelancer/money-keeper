import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CategoriesPage, CreateCategoryUseCase } from '..';
import { parseCategoryType } from '..';

// --- Helpers ---
function slugify(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

async function categoryVisibleByAny(thisWorld: any, name: string): Promise<boolean> {
  const slug = slugify(name);
  // Priority data-testid (if any)
  const byTestId = thisWorld.page.getByTestId(`category-node-${slug}`);
  if (await byTestId.isVisible().catch(() => false)) return true;

  // Fallback: find by role/treeitem or text
  const byRole = thisWorld.page.getByRole('treeitem', { name, exact: true });
  if (await byRole.isVisible().catch(() => false)) return true;

  const byText = thisWorld.page.locator(`text=${name}`);
  return byText.first().isVisible().catch(() => false);
}

// --- Step Definitions ---

Given('I am on the categories page', async function () {
  const pom = new CategoriesPage(this.page);
  await pom.goto('/categories');
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
  const typeStr = obj.type ?? obj.Type ?? '';
  
  expect(name, 'Missing "name" in DataTable').toBeTruthy();
  
  // Validate category type with proper error handling
  let type;
  try {
    type = parseCategoryType(typeStr);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid category type in DataTable: ${errorMessage}`);
  }

  const pom = new CategoriesPage(this.page);
  const usecase = new CreateCategoryUseCase(pom);

  // Store the validated type for potential use in the use case
  this.validatedCategoryType = type;

  const result = await usecase.run(
    { name, icon, timeoutMs: 15000 },
    {
      verify: true,
      verifier: async (n) => {
        if (typeof (pom as any).categoryExists === 'function') {
          return (pom as any).categoryExists(n);
        }
        return categoryVisibleByAny(this, n);
      },
      settleAfterMs: 100,
      verifyRetries: 6,
      verifyIntervalMs: 300
    }
  );

  expect(result.ok, result.ok ? '' : result.error).toBeTruthy();
});

Then('the category {string} should appear in the category tree', async function (name: string) {
  const pom = new CategoriesPage(this.page);
  const exists = await pom.hasCategory(name);
  expect(exists, `Expected category "${name}" to appear in the category tree`).toBe(true);
});

Then('the category tree should not show {string}', async function (text: string) {
  const byTestId = this.page.getByTestId('no-data').or(this.page.getByTestId('empty-state'));
  if (await byTestId.isVisible().catch(() => false)) {
    await expect(byTestId).not.toBeVisible();
    return;
  }
  
  const byText = this.page.getByText(text, { exact: false });
  await expect(byText).not.toBeVisible();
});
