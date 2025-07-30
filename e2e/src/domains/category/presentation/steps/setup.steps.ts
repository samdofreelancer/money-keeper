import { Given } from "@cucumber/cucumber";

import { generateCategoryName } from "../../../../shared/test-data-utils";

Given(
  "a category {string} with icon {string} and type {string} exists",
  async function (name: string, icon: string, type: string) {
    await this.getCategoryUseCase().ensureParentCategoryExists(
      generateCategoryName(name, this.scenarioId),
      icon,
      type,
      undefined,
      this.trackCreatedCategory?.bind(this)
    );
    const isVisible = await this.getCategoryUseCase().isCategoryCreated(name);
    if (!isVisible) {
      throw new Error(
        `Category '${name}' was not found on the UI after backend creation.`
      );
    }
  }
);
