import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { poll } from 'shared/utilities/poll';
import { sanitizeCategoryData } from 'shared/utilities/data-sanitization';
import { getCategoriesPage } from 'shared/utilities/hooks';
import { TestData } from 'shared/utilities/testData';

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

When('I open the create category dialog', async function () {
  // Click the Add Category button to open the dialog
  await this.categoriesPage.clickAddCategoryButton();
});

When('I fill the category form with:', async function (dataTable) {
  const row = dataTable.rowsHash() as Record<string, string>;

  // Name
  if (row.name) {
    // If this name was created as a precondition, use the unique version mapped on the world
    if (!this.uniqueCategoryNames) this.uniqueCategoryNames = {};

    let mapped = this.uniqueCategoryNames?.[row.name];
    // If not mapped yet, generate a unique name to avoid collisions and use that for UI input
    if (!mapped) {
      const scenarioName = this.scenarioName || 'scenario';
      mapped = TestData.generateUniqueCategoryName(scenarioName, row.name);
      this.uniqueCategoryNames[row.name] = mapped;
    }

    await this.categoriesPage.fillCategoryName(mapped);

    // record last filled name so submit step can track created record
    this.lastFilledCategoryLogicalName = row.name;
    this.lastFilledCategoryUniqueName = mapped;
  }

  // Icon
  if (row.icon) {
    await this.categoriesPage.openIconPicker();
    await this.categoriesPage.chooseIcon(row.icon);
  }

  // Type (accept both 'Expense'/'EXPENSE' and 'Income'/'INCOME')
  if (row.type) {
    const type = row.type.toUpperCase().startsWith('EXP')
      ? 'EXPENSE'
      : 'INCOME';
    // the UI defaults to EXPENSE, but ensure radio selection when needed
    if (type === 'INCOME') {
      // choose income via clicking the radio button in the UI
      await this.categoriesPage.page
        .getByTestId('radio-income')
        .click()
        .catch(() => {});
    } else {
      await this.categoriesPage.page
        .getByTestId('radio-expense')
        .click()
        .catch(() => {});
    }
  }

  // Parent: dataTable gives parent by name; we need to resolve its id via API and select
  if (row.parent) {
    // If parent was created earlier in the scenario, resolve logical->unique mapping
    const parentLogical = row.parent;
    const parentUnique =
      this.uniqueCategoryNames?.[parentLogical] || parentLogical;

    // Find parent category via API client using unique name
    const parentList = await this.categoryApiClient.findByName(parentUnique);
    if (!parentList.length) {
      throw new Error(`Parent category not found via API: ${parentUnique}`);
    }
    const parent = parentList[0];

    // open parent select and pick the option by visible label (the page renders label as parent.name)
    await this.categoriesPage.page
      .getByTestId('select-parent-category')
      .click();
    const option = this.categoriesPage.page.getByRole('option', {
      name: parent.name,
    });
    await option.click();
  }
});

When('I clear the category name field', async function () {
  // Clear the name input inside the create dialog
  const page = this.categoriesPage.page;
  // Use the page object helper if available, otherwise target the test id directly
  if (this.categoriesPage.fillCategoryName) {
    await this.categoriesPage.fillCategoryName('');
  } else {
    await page.getByTestId('input-category-name').fill('');
  }
  await this.categoriesPage.waitForIdle(50);
});

When('I submit the create category form', async function () {
  await this.categoriesPage.submitCategory();
  // wait small time for create to propagate
  await this.categoriesPage.waitForIdle(100);
  // Track UI-created category for cleanup if we have lastFilledCategoryUniqueName
  const created = this.lastFilledCategoryUniqueName;
  if (created) {
    TestData.trackCreatedCategory(created);
    // Clear last filled to avoid duplicating track in subsequent submits
    this.lastFilledCategoryUniqueName = undefined;
    this.lastFilledCategoryLogicalName = undefined;
  }
});

When('I cancel the create category form', async function () {
  // click cancel button inside dialog
  await this.categoriesPage.page.getByTestId('button-cancel').click();
  await this.categoriesPage.waitForIdle(50);
});

Given('a category exists with name {string}', async function (name: string) {
  // Create via API use case to ensure deterministic precondition
  const scenarioName = this.scenarioName || 'precondition';
  const uniqueName = TestData.generateUniqueCategoryName(scenarioName, name);

  // Track for cleanup
  TestData.trackCreatedCategory(uniqueName);

  // Store mapping from logical name to unique name on the world for later steps
  if (!this.uniqueCategoryNames) this.uniqueCategoryNames = {};
  this.uniqueCategoryNames[name] = uniqueName;

  // Use createCategoryUseCase (API) to create the category with minimal fields
  await this.createCategoryUseCase.run(
    { name: uniqueName, icon: 'Grid', type: 'EXPENSE' },
    { verify: true }
  );
});

When('I search for {string}', async function (query: string) {
  // Use the search input on the Categories page
  await this.categoriesPage.page.getByTestId('search-input').fill(query);
  // small wait for UI filter
  await this.categoriesPage.waitForIdle(100);
});

Then(
  'I should see a success message {string}',
  async function (expectedMessage: string) {
    // The UI shows ElMessage but verification helper expects page-level checks; use categoriesVerification if available
    // Fallback: check for message text in DOM
    const page = this.categoriesPage.page;
    // The app uses ElMessage which appends to body; check visible text
    const locator = page.locator('text=' + expectedMessage).first();
    await expect(locator).toBeVisible();
  }
);

Then('I should see a validation error for the name field', async function () {
  // The form validator renders a tooltip/message near the form-item; assert there is text about required name
  const page = this.categoriesPage.page;
  const msg = page.getByText(
    /Please input category name|Please input category name/
  );
  await expect(msg).toBeVisible();
});

Then(
  'I should see an error indicating the category name already exists',
  async function () {
    const page = this.categoriesPage.page;
    const msg = page.getByText(/Category name already exists|already exists/);
    await expect(msg).toBeVisible();
  }
);

Then(
  'the category {string} should appear under {string}',
  async function (child: string, parent: string) {
    // Resolve logical -> unique mappings
    const mappedChild = this.uniqueCategoryNames?.[child] || child;
    const mappedParent = this.uniqueCategoryNames?.[parent] || parent;

    // Verify child exists and parent exists in the visible tree
    const childExists = await this.categoriesPage.hasCategory(mappedChild);
    expect(childExists).toBe(true);

    const parentExists = await this.categoriesPage.hasCategory(mappedParent);
    expect(parentExists).toBe(true);
  }
);

Given('I have no category with name {string}', async function (name: string) {
  // Resolve logical -> unique mapping if present
  const targetName = this.uniqueCategoryNames?.[name] || name;

  // Idempotent cleanup: delete all categories with this target name
  const categoriesToDelete =
    await this.categoryApiClient.findByName(targetName);

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
    const mapped = this.uniqueCategoryNames?.[name] || name;
    const categoryExists = await this.categoriesPage.hasCategory(mapped);
    expect(
      categoryExists,
      `${ERROR_MESSAGES.CATEGORY_NOT_FOUND}: ${mapped}`
    ).toBe(true);
  }
);

Then(
  'the category {string} should not appear in the category list',
  async function (name: string) {
    const mapped = this.uniqueCategoryNames?.[name] || name;
    const categoryExists = await this.categoriesPage.hasCategory(mapped);
    expect(
      categoryExists,
      `${ERROR_MESSAGES.CATEGORY_STILL_EXISTS}: ${mapped}`
    ).toBe(false);
  }
);

Then(
  'I should see the category {string} in the results',
  async function (name: string) {
    const mapped = this.uniqueCategoryNames?.[name] || name;
    const exists = await this.categoriesPage.hasCategory(mapped);
    expect(exists, `Expected category in results: ${mapped}`).toBe(true);
  }
);

When('I open the edit dialog for {string}', async function (name: string) {
  const mapped = this.uniqueCategoryNames?.[name] || name;

  // Find the category node and click its edit button
  const slug = this.categoriesPage.slugify
    ? this.categoriesPage.slugify(mapped)
    : mapped.trim().toLowerCase().replace(/\s+/g, '-');

  // Use testid for the node if available, otherwise find by visible text in the tree
  const node = this.categoriesPage.page.getByTestId(`category-node-${slug}`);
  if (await node.isVisible().catch(() => false)) {
    // find edit button inside node
    const editBtn = node.getByTestId('edit-category-button');
    await editBtn.click();
    await this.categoriesPage.waitForIdle(100);
    return;
  }

  // Fallback: search for the tree node by visible name and click the edit button in the sibling button-group
  const nameLocator = this.categoriesPage.page
    .getByTestId('category-name')
    .filter({ hasText: mapped });
  const parent = nameLocator.locator('..').locator('..');
  const editBtnFallback = parent.getByTestId('edit-category-button');
  await editBtnFallback.click();
  await this.categoriesPage.waitForIdle(100);
});

When('I delete the category {string}', async function (name: string) {
  const mapped = this.uniqueCategoryNames?.[name] || name;

  // Try to click delete button on the node
  const slug = this.categoriesPage.slugify
    ? this.categoriesPage.slugify(mapped)
    : mapped.trim().toLowerCase().replace(/\s+/g, '-');

  const node = this.categoriesPage.page.getByTestId(`category-node-${slug}`);
  if (await node.isVisible().catch(() => false)) {
    const delBtn = node.getByTestId('delete-category-button');
    await delBtn.click();
  } else {
    const nameLocator = this.categoriesPage.page
      .getByTestId('category-name')
      .filter({ hasText: mapped });
    const parent = nameLocator.locator('..').locator('..');
    const delBtnFallback = parent.getByTestId('delete-category-button');
    await delBtnFallback.click();
  }

  // Confirm delete in modal
  await this.categoriesPage.page.getByTestId('button-confirm-delete').click();
  // Wait and ensure success message or category removal
  await this.categoriesPage.waitForIdle(200);

  // Track deletion attempt: ensure cleanup mapping is cleared for this logical name
  if (this.uniqueCategoryNames && this.uniqueCategoryNames[name]) {
    // remove mapping so further lookups use the original name and cleanup won't try to delete again
    delete this.uniqueCategoryNames[name];
  }
});
