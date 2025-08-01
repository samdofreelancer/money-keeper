import { When, Then } from "@cucumber/cucumber";

import { CustomWorld } from "../../../../support/world";
import { generateCategoryName } from "../../../../shared/test-data-utils";

// Simple creation
When(
  "I create a category with name {string}, icon {string}, type {string}",
  async function (this: CustomWorld, name, icon, type) {
    await this.getCategoryUseCase().createUniqueCategory(
      generateCategoryName(name, this.scenarioId),
      icon,
      type,
      undefined,
      this.trackCreatedCategory?.bind(this)
    );
  }
);

Then(
  "the category {string} should be created successfully",
  async function (name) {
    const created = await this.getCategoryUseCase().isCategoryCreated(name);
    if (!created)
      throw new Error(`Category ${name} was not created successfully`);
  }
);

// Parent-child creation
When(
  "I create a category with name {string}, icon {string}, type {string} and parent {string}",
  async function (name, icon, type, parent) {
    await this.getCategoryUseCase().createCategoryWithParentWorkflow(
      generateCategoryName(name, this.scenarioId),
      icon,
      type,
      parent,
      this.trackCreatedCategory?.bind(this)
    );
  }
);

Then(
  "the category {string} should be created as a child of {string}",
  async function (child, parent) {
    const isChild = await this.getCategoryUseCase().isCategoryChildOf(
      child,
      parent
    );
    if (!isChild)
      throw new Error(`Category ${child} is not a child of ${parent}`);
  }
);

Then("the unique category should be created successfully", async function () {
  if (!this.createdCategoryName) {
    throw new Error("No unique category was created");
  }
  const created = await this.getCategoryUseCase().isCategoryCreated(
    this.createdCategoryName
  );
  if (!created) {
    throw new Error(
      `Category ${this.createdCategoryName} was not created successfully`
    );
  }
});

When(
  "I create a category with name {string}, icon {string}, type {string}, and parent {string}",
  async function (name: string, icon: string, type: string, parent: string) {
    await this.getCategoryUseCase().createCategory(name, icon, type, parent);
  }
);

When(
  "I create a category with name {string}, icon {string}, and type {string}",
  async function (name: string, icon: string, type: string) {
    await this.getCategoryUseCase().createCategory(name, icon, type);
  }
);
