import { Given, When, Then } from "@cucumber/cucumber";

import { generateCategoryName } from "../../../../shared/test-data-utils";

Given(
  "a category {string} with icon {string} and type {string} and parent {string} exists",
  async function (name, icon, type, parent) {
    await this.getCategoryUseCase().createChildCategory(
      generateCategoryName(name, this.scenarioId),
      icon,
      type,
      generateCategoryName(parent, this.scenarioId),
      this.trackCreatedCategory?.bind(this),
      this.page
    );
  }
);

When(
  "I update category {string} to have parent {string}",
  async function (name, newParent) {
    await this.getCategoryUseCase().updateCategoryParent(
      generateCategoryName(name, this.scenarioId),
      generateCategoryName(newParent, this.scenarioId)
    );
  }
);

Then(
  "the update should fail with error {string}",
  async function (errorMessage) {
    const toastVisible = await this.getCategoryUseCase().waitForToastMessage(
      errorMessage,
      10000
    );
    if (!toastVisible) {
      const errorVisible =
        await this.getCategoryUseCase().isErrorMessageVisible(errorMessage);
      if (!errorVisible)
        throw new Error(`Expected error "${errorMessage}" not found`);
    }

    const dialogVisible = await this.page.isVisible(
      '[data-testid="category-dialog"]'
    );
    if (!dialogVisible)
      throw new Error(`Expected category dialog to remain open`);
  }
);
