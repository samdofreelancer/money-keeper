import { When, Then } from "@cucumber/cucumber";

import { generateCategoryName } from "../../../../shared/test-data-utils";

When("I delete the category {string}", async function (name) {
  await this.getCategoryUseCase().deleteCategory(
    generateCategoryName(name, this.scenarioId)
  );
});

Then(
  "the deletion should fail with error {string}",
  async function (errorMessage) {
    const errorVisible =
      await this.getCategoryUseCase().isErrorMessageVisibleInErrorBox(
        errorMessage
      );
    if (!errorVisible) {
      throw new Error(
        `Expected deletion error "${errorMessage}" was not visible.`
      );
    }
  }
);
