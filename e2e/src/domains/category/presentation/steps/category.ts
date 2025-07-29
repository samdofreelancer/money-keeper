import { Given, When, Then, After } from "@cucumber/cucumber";

import { CustomWorld } from "../../../../support/world";

Given("the system has no categories", async function () {
  // Implement logic to clear all categories if needed
});

Given("the user is on the Category Management page", async function (this: CustomWorld) {
  await this.getCategoryUseCase().navigateToCategoryPage();
  await this.getCategoryUseCase().assertOnCategoryPage();
});

When(
  "I create a category with name {string}, icon {string}, type {string}",
  async function (name: string, icon: string, type: string) {
    await this.getCategoryUseCase().createUniqueCategory(
      name,
      icon,
      type,
      undefined,
      this.trackCreatedCategory?.bind(this)
    );
  }
);

When(
  "I create a category with name {string}, icon {string}, type {string} and parent {string}",
  async function (name: string, icon: string, type: string, parent: string) {
    await this.getCategoryUseCase().createCategoryWithParentWorkflow(
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
    const created = await this.getCategoryUseCase().isCategoryCreated(name);
    if (!created) {
      throw new Error(`Category ${name} was not created successfully`);
    }
  }
);

Then("the unique category should be created successfully", async function () {
  if (!this.createdCategoryName) {
    throw new Error("No unique category was created");
  }
  const created = await this.getCategoryUseCase().isCategoryCreated(this.createdCategoryName);
  if (!created) {
    throw new Error(
      `Category ${this.createdCategoryName} was not created successfully`
    );
  }
});

Given(
  "a category {string} with icon {string} and type {string} exists",
  async function (name: string, icon: string, type: string) {
    // Use use case to ensure category exists via backend API and track it
    await this.getCategoryUseCase().ensureParentCategoryExists(
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
    const isVisible = await this.getCategoryUseCase().isCategoryCreated(name);
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
    await this.getCategoryUseCase().createCategory(name, icon, type, parent);
  }
);

Then(
  "the category {string} should be created as a child of {string}",
  async function (child: string, parent: string) {
    const isChild = await this.getCategoryUseCase().isCategoryChildOf(child, parent);
    if (!isChild) {
      throw new Error(`Category ${child} is not a child of ${parent}`);
    }
  }
);

When(
  "I create another category with name {string}, icon {string}, type {string}",
  async function (name: string, icon: string, type: string) {
    await this.getCategoryUseCase().createCategoryWithDuplicateName(name, icon, type);
  }
);

Then(
  "the category creation should fail with error {string}",
  async function (errorMessage: string) {
    // Wait for the toast message to appear
    const toastVisible = await this.getCategoryUseCase().waitForToastMessage(
      errorMessage,
      10000
    );
    if (!toastVisible) {
      // Fallback to checking for any error message
      const errorVisible = await this.getCategoryUseCase().isErrorMessageVisible(
        errorMessage
      );
      if (!errorVisible) {
        throw new Error(
          `Expected error message "${errorMessage}" was not visible in toast or form`
        );
      }
    }
  }
);

Given(
  "a category {string} with icon {string} and type {string} and parent {string} exists",
  async function (name: string, icon: string, type: string, parent: string) {
    await this.getCategoryUseCase().createChildCategory(
      name,
      icon,
      type,
      parent,
      this.trackCreatedCategory
        ? this.trackCreatedCategory.bind(this)
        : undefined,
      this.page
    );
  }
);

When(
  "I update category {string} to have parent {string}",
  async function (name: string, newParent: string) {
    await this.getCategoryUseCase().updateCategoryParent(name, newParent);
  }
);

Then(
  "the update should fail with error {string}",
  async function (errorMessage: string) {
    // Wait for the toast message to appear
    const toastVisible = await this.getCategoryUseCase().waitForToastMessage(
      errorMessage,
      10000
    );
    if (!toastVisible) {
      // Fallback to checking for any error message
      const errorVisible = await this.getCategoryUseCase().isErrorMessageVisible(
        errorMessage
      );
      if (!errorVisible) {
        throw new Error(
          `Expected error message "${errorMessage}" was not visible in toast or form`
        );
      }
    }

    // Wait a bit for the UI to stabilize
    await this.page.waitForTimeout(1000);

    // Verify that the form is still open (indicating the update failed)
    const dialogVisible = await this.page.isVisible(
      '[data-testid="category-dialog"]'
    );
    if (!dialogVisible) {
      throw new Error(
        `Expected category dialog to remain open after failed update, but it was closed`
      );
    }
  }
);

When(
  "I create a category with a name longer than the maximum allowed length",
  async function () {
    // Call a use case method that handles long name generation internally
    await this.getCategoryUseCase().attemptToCreateCategoryWithNameExceedingMaxLength(
      "default-icon",
      "expense"
    );
  }
);

When(
  "I create a category with a name of {int} characters, icon {string}, and type {string}",
  async function (length: number, icon: string, type: string) {
    const name = await this.getCategoryUseCase().createCategoryWithGeneratedName(
      length,
      icon,
      type,
      this.trackCreatedCategory.bind(this)
    );
    this.generatedCategoryName = name;
  }
);

When(
  "I attempt to create a category with a name of {int} characters, icon {string}, and type {string}",
  async function (length: number, icon: string, type: string) {
    const name = this.getCategoryUseCase().generateUniqueName(length);
    this.generatedCategoryName = name;
    await this.getCategoryUseCase().createCategory(
      name,
      icon,
      type,
      undefined,
      true, // expectError: true (error case)
      this.trackCreatedCategory.bind(this)
    );
  }
);

Then(
  "the category with a name of {int} characters should be created successfully",
  async function (length: number) {
    const name = this.generatedCategoryName;
    if (!name) {
      throw new Error("No generated category name found for assertion");
    }
    const created = await this.getCategoryUseCase().isCategoryCreated(name);
    if (!created) {
      throw new Error(
        `Category with a name of ${length} characters was not created successfully (name: ${name})`
      );
    }
  }
);

When("I delete the category {string}", async function (name: string) {
  await this.getCategoryUseCase().deleteCategory(name);
});

Then(
  "the deletion should fail with error {string}",
  async function (errorMessage: string) {
    const errorVisible = await this.getCategoryUseCase().isErrorMessageVisibleInErrorBox(
      errorMessage
    );
    if (!errorVisible) {
      throw new Error(
        `Expected error message "${errorMessage}" was not visible in the category page error-message element.`
      );
    }
  }
);

When(
  "I create a category with name {string}, icon {string}, and type {string}",
  async function (name: string, icon: string, type: string) {
    await this.getCategoryUseCase().createCategory(name, icon, type);
  }
);

Given(
  "categories {string}, {string}, and {string} exist",
  async function (name1: string, name2: string, name3: string) {
    await this.getCategoryUseCase().createCategory(name1, "", "expense");
    await this.getCategoryUseCase().createCategory(name2, "", "income");
    await this.getCategoryUseCase().createCategory(name3, "", "expense");
  }
);

When("I list all categories", async function () {
  this.categories = await this.getCategoryUseCase().listCategories();
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
    await this.getCategoryUseCase().updateCategoryNameAndIcon(oldName, newName, newIcon);
  }
);

After(async function () {
  // Clean up all tracked categories after each scenario
  if (this.createdCategoryIds && this.createdCategoryIds.length > 0) {
    for (const { id } of this.createdCategoryIds) {
      try {
        await this.getCategoryUseCase().deleteCategory(id);
      } catch (e) {
        // Ignore errors if the category does not exist
      }
    }
    this.createdCategoryIds = [];
  }
});

When(
  "I attempt to create a category with a name that is too long, icon {string}, and type {string}",
  async function (icon: string, type: string) {
    await this.getCategoryUseCase().attemptToCreateCategoryWithNameExceedingMaxLength(
      icon,
      type,
      this.trackCreatedCategory?.bind(this)
    );
  }
);
