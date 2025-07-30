import { Given } from "@cucumber/cucumber";

import { CustomWorld } from "../../../../support/world";

Given(
  "the user is on the Category Management page",
  async function (this: CustomWorld) {
    await this.getCategoryUseCase().navigateToCategoryPage();
    await this.getCategoryUseCase().assertOnCategoryPage();
  }
);
