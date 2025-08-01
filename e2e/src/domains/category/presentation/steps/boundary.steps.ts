import { When, Then } from "@cucumber/cucumber";

import { generateUniqueNameByLength } from "../../../../shared/test-data-utils";
import { CustomWorld } from "../../../../support/world";

When(
  "I create a category with a name of {int} characters, icon {string}, and type {string}",
  async function (length, icon, type) {
    const name =
      await this.getCategoryUseCase().createCategoryWithGeneratedName(
        generateUniqueNameByLength(length, this.scenarioId),
        icon,
        type,
        this.trackCreatedCategory?.bind(this)
      );
    this.generatedCategoryName = name;
  }
);

Then(
  "the category with a name of {int} characters should be created successfully",
  async function (this: CustomWorld, length: number) {
    const name = this.generatedCategoryName;
    if (!name) throw new Error("No generated category name found");
    const created = await this.getCategoryUseCase().isCategoryCreated(name);
    if (!created)
      throw new Error(
        `Category with a ${length}-char name (${name}) was not created`
      );
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
      true, // expectError
      this.trackCreatedCategory.bind(this)
    );
  }
);
