import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CategoriesPage } from '../pages/categories.playwright.page';
import { CreateCategoryUseCase } from '../usecases/ui/category.use-case';

// --- Helpers ---
function slugify(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

async function categoryVisibleByAny(thisWorld: any, name: string): Promise<boolean> {
  const slug = slugify(name);
  // Ưu tiên data-testid nếu có
  const byTestId = thisWorld.page.getByTestId(`category-node-${slug}`);
  if (await byTestId.isVisible().catch(() => false)) return true;

  // Fallback: tìm theo role/treeitem hoặc text
  const byRole = thisWorld.page.getByRole('treeitem', { name, exact: true });
  if (await byRole.isVisible().catch(() => false)) return true;

  const byText = thisWorld.page.locator(`text=${name}`);
  return byText.first().isVisible().catch(() => false);
}

async function deleteCategoryIfExists(thisWorld: any, name: string): Promise<void> {
  const pom = new CategoriesPage(thisWorld.page);
  // Nếu POM có method xóa, dùng thẳng:
  if (typeof (pom as any).deleteCategory === 'function') {
    const existed = typeof (pom as any).categoryExists === 'function'
      ? await (pom as any).categoryExists(name)
      : await categoryVisibleByAny(thisWorld, name);
    if (existed) {
      await (pom as any).deleteCategory(name);
      // chờ UI settle nhẹ
      await pom.waitForIdle(100);
    }
    return;
  }

  // Fallback xoá thô nếu chưa có method trong POM:
  const slug = slugify(name);
  // 1) tìm node
  const node =
    thisWorld.page.getByTestId(`category-node-${slug}`)
      .or(thisWorld.page.getByRole('treeitem', { name, exact: true }))
      .or(thisWorld.page.locator(`text=${name}`));
  if (!(await node.isVisible().catch(() => false))) return;

  // 2) mở menu xóa (tùy DOM của bạn: đổi testid cho khớp)
  const openMenuBtn =
    thisWorld.page.getByTestId(`btn-category-menu-${slug}`)
      .or(node.locator('[data-testid="btn-category-menu"]'))
      .or(node.locator('button[aria-label="More actions"]'));
  if (await openMenuBtn.isVisible().catch(() => false)) {
    await openMenuBtn.click().catch(() => {});
  }

  // 3) bấm delete
  const deleteBtn =
    thisWorld.page.getByTestId(`btn-delete-category-${slug}`)
      .or(thisWorld.page.getByRole('menuitem', { name: /delete/i }))
      .or(thisWorld.page.getByRole('button', { name: /delete/i }));
  await deleteBtn.click().catch(() => {});

  // 4) confirm nếu có dialog xác nhận
  const confirm =
    thisWorld.page.getByTestId('confirm-delete')
      .or(thisWorld.page.getByRole('button', { name: /confirm|ok|yes/i }));
  if (await confirm.isVisible().catch(() => false)) {
    await confirm.click().catch(() => {});
  }
}

// --- Step Definitions ---

Given('I am on the categories page', async function () {
  const pom = new CategoriesPage(this.page);
  await pom.goto('/categories');
});

Given('I have no category with name {string}', async function (name: string) {
  await deleteCategoryIfExists(this, name);
  const exists = await categoryVisibleByAny(this, name);
  expect(exists, `Expected category "${name}" to be absent before creation`).toBeFalsy();
});

When('I create a new category with:', async function (dataTable) {
  const obj = dataTable.rowsHash() as Record<string, string>;
  const name = obj.name ?? obj.Name ?? '';
  const icon = obj.icon ?? obj.Icon ?? undefined;
  // type (Expense/Income) tạm bỏ qua nếu UI chưa có; bạn có thể extend Use Case để set type.
  expect(name, 'Missing "name" in DataTable').toBeTruthy();

  const pom = new CategoriesPage(this.page);
  const usecase = new CreateCategoryUseCase(pom);

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
  await pom.expectCategoryVisible(name);
});

Then('the category tree should not show {string}', async function (text: string) {
  // Ưu tiên testid 'no-data' nếu có
  const byTestId = this.page.getByTestId('no-data').or(this.page.getByTestId('empty-state'));
  if (await byTestId.isVisible().catch(() => false)) {
    await expect(byTestId).not.toBeVisible();
    return;
  }
  // Fallback: không thấy text "No Data"
  const byText = this.page.getByText(text, { exact: false });
  await expect(byText).not.toBeVisible();
});

When('I delete the category {string}', async function (name: string) {
  await deleteCategoryIfExists(this, name);
});

Then('the category {string} should no longer appear in the category tree', async function (name: string) {
  const pom = new CategoriesPage(this.page);
  await pom.expectCategoryNotVisible(name);
});
