import { Given, When, Then, After } from "@cucumber/cucumber";

import { CategoryUseCasesFactory } from "../../application/use-cases/CategoryUseCasesFactory";
import { CategoryPage } from "../../infrastructure/pages/category.page";

let categoryUseCases: CategoryUseCasesFactory;
let createdCategoryName: string | null = null;

Given("the system has no categories", async function () {
  const categoryPage = new CategoryPage(this.page);
  categoryUseCases = new CategoryUseCasesFactory(categoryPage);
  // Implement logic to clear all categories if needed
});

Given("the user is on the Category Management page", async function () {
  await categoryUseCases.navigateToCategoryPage();
  await categoryUseCases.assertOnCategoryPage();
});

When(
  "I create a category with name {string}, icon {string}, type {string}",
  async function (name: string, icon: string, type: string) {
    await categoryUseCases.createUniqueCategory(
      name,
      icon,
      type,
      undefined,
      this.trackCreatedCategory
        ? this.trackCreatedCategory.bind(this)
        : undefined
    );
  }
);

When(
  "I create a category with name {string}, icon {string}, type {string} and parent {string}",
  async function (name: string, icon: string, type: string, parent: string) {
    await categoryUseCases.createCategoryWithParentWorkflow(
      name,
      icon,
      type,
      parent,
      this.trackCreatedCategory?.bind(this)
    );
  }
);

Then(
  "the category {string} should be created successfully",
  async function (name: string) {
    const created = await categoryUseCases.isCategoryCreated(name);
    if (!created) {
      throw new Error(`Category ${name} was not created successfully`);
    }
  }
);

Then("the unique category should be created successfully", async function () {
  if (!createdCategoryName) {
    throw new Error("No unique category was created");
  }
  const created = await categoryUseCases.isCategoryCreated(createdCategoryName);
  if (!created) {
    throw new Error(
      `Category ${createdCategoryName} was not created successfully`
    );
  }
});

After(async function () {
  if (createdCategoryName) {
    await categoryUseCases.deleteCategory(createdCategoryName);
    createdCategoryName = null;
  }
});

Given(
  "a category {string} with icon {string} and type {string} exists",
  async function (name: string, icon: string, type: string) {
    // Use use case to ensure category exists via backend API and track it
    await categoryUseCases.ensureParentCategoryExists(
      name,
      icon,
      type,
      undefined,
      this.trackCreatedCategory
        ? this.trackCreatedCategory.bind(this)
        : undefined
    );
    // Reload the page to ensure the UI reflects the new backend data
    await this.page.reload();
    // Assert the new category is visible on the UI
    const isVisible = await categoryUseCases.isCategoryCreated(name);
    if (!isVisible) {
      throw new Error(
        `Category '${name}' was not found on the UI after backend creation and reload.`
      );
    }
  }
);

When(
  "I create a category with name {string}, icon {string}, type {string}, and parent {string}",
  async function (name: string, icon: string, type: string, parent: string) {
    await categoryUseCases.createCategory(name, icon, type, parent);
  }
);

Then(
  "the category {string} should be created as a child of {string}",
  async function (child: string, parent: string) {
    const isChild = await categoryUseCases.isCategoryChildOf(child, parent);
    if (!isChild) {
      throw new Error(`Category ${child} is not a child of ${parent}`);
    }
  }
);

When(
  "I create another category with name {string}, icon {string}, type {string}",
  async function (name: string, icon: string, type: string) {
    await categoryUseCases.createCategoryWithDuplicateName(name, icon, type);
  }
);

Then(
  "the category creation should fail with error {string}",
  async function (errorMessage: string) {
    const errorVisible = await categoryUseCases.isErrorMessageVisible(
      errorMessage
    );
    if (!errorVisible) {
      throw new Error(
        `Expected error message "${errorMessage}" was not visible`
      );
    }
  }
);

Given(
  "a category {string} with icon {string} and type {string} and parent {string} exists",
  async function (name: string, icon: string, type: string, parent: string) {
    await categoryUseCases.createCategory(name, icon, type, parent);
  }
);

When(
  "I update category {string} to have parent {string}",
  async function (name: string, newParent: string) {
    await categoryUseCases.updateCategoryParent(name, newParent);
  }
);

Then(
  "the update should fail with error {string}",
  async function (errorMessage: string) {
    const errorVisible = await categoryUseCases.isErrorMessageVisible(
      errorMessage
    );
    if (!errorVisible) {
      throw new Error(
        `Expected error message "${errorMessage}" was not visible`
      );
    }
  }
);

When(
  "I create a category with a name longer than the maximum allowed length",
  async function () {
    const longName = "A".repeat(256); // Assuming 255 is max length
    await categoryUseCases.createCategory(longName, "X", "expense");
  }
);

When("I delete the category {string}", async function (name: string) {
  await categoryUseCases.deleteCategory(name);
});

Then(
  "the deletion should fail with error {string}",
  async function (errorMessage: string) {
    const errorVisible = await categoryUseCases.isErrorMessageVisible(
      errorMessage
    );
    if (!errorVisible) {
      throw new Error(
        `Expected error message "${errorMessage}" was not visible`
      );
    }
  }
);

When(
  "I create a category with name {string}, icon {string}, and type {string}",
  async function (name: string, icon: string, type: string) {
    await categoryUseCases.createCategory(name, icon, type);
  }
);

Given(
  "categories {string}, {string}, and {string} exist",
  async function (name1: string, name2: string, name3: string) {
    await categoryUseCases.createCategory(name1, "", "expense");
    await categoryUseCases.createCategory(name2, "", "income");
    await categoryUseCases.createCategory(name3, "", "expense");
  }
);

When("I list all categories", async function () {
  this.categories = await categoryUseCases.listCategories();
});

Then(
  "I should see {string}, {string}, and {string} in the category list",
  async function (name1: string, name2: string, name3: string) {
    const categories = this.categories || [];
    if (
      !categories.includes(name1) ||
      !categories.includes(name2) ||
      !categories.includes(name3)
    ) {
      throw new Error(
        `Expected categories ${name1}, ${name2}, and ${name3} to be listed`
      );
    }
  }
);

When(
  "I update the category {string} to have name {string} and icon {string}",
  async function (oldName: string, newName: string, newIcon: string) {
    await categoryUseCases.updateCategoryNameAndIcon(oldName, newName, newIcon);
  }
);
