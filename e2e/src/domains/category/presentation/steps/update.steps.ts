import { When } from "@cucumber/cucumber";

When(
  "I update the category {string} to have name {string} and icon {string}",
  async function (oldName, newName, newIcon) {
    await this.getCategoryUseCase().updateCategoryNameAndIcon(
      oldName,
      newName,
      newIcon
    );
  }
);
