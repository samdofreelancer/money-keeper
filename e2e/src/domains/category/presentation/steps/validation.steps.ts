import { When, Then } from "@cucumber/cucumber";

import {
  generateCategoryName,
  generateUniqueNameByLength,
} from "../../../../shared/test-data-utils";

When(
  "I create another category with name {string}, icon {string}, type {string}",
  async function (name, icon, type) {
    await this.getCategoryUseCase().createCategoryWithDuplicateName(
      generateCategoryName(name, this.scenarioId),
      icon,
      type
    );
  }
);

Then(
  "the category creation should fail with error {string}",
  async function (errorMessage) {
    const toastVisible = await this.getCategoryUseCase().waitForToastMessage(
      errorMessage,
      10000
    );
    if (!toastVisible) {
      const errorVisible =
        await this.getCategoryUseCase().isErrorMessageVisible(errorMessage);
      if (!errorVisible) {
        throw new Error(
          `Expected error "${errorMessage}" not visible in toast or form`
        );
      }
    }
  }
);

When(
  "I create a category with a name longer than the maximum allowed length",
  async function () {
    await this.getCategoryUseCase().attemptToCreateCategoryWithNameExceedingMaxLength(
      generateUniqueNameByLength(101, this.scenarioId),
      "default-icon",
      "expense"
    );
  }
);

When(
  "I attempt to create a category with a name that is too long, icon {string}, and type {string}",
  async function (icon: string, type: string) {
    await this.getCategoryUseCase().attemptToCreateCategoryWithNameExceedingMaxLength(
      generateUniqueNameByLength(256, this.scenarioId),
      icon,
      type,
      this.trackCreatedCategory?.bind(this)
    );
  }
);
