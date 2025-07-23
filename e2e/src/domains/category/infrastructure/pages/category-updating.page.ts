import { Page } from "@playwright/test";
import { BasePage } from "../../../../shared/infrastructure/pages/base.page";
import { CategoryFormComponent, CategoryFormParams } from "./category-form.component";

export class CategoryUpdatingPage extends BasePage {
  private categoryForm: CategoryFormComponent;

  constructor(public page: Page) {
    super(page);
    this.categoryForm = new CategoryFormComponent(page);
  }

  async updateCategoryNameAndIcon(
    oldName: string,
    newName: string,
    newIcon: string
  ): Promise<void> {
    this.logger.info(`Updating category name from '${oldName}' to '${newName}' and icon to '${newIcon}'`);
    // Click the category to edit
    await this.page.click(`text=${oldName}`);

    // Fill new name and select new icon using form component
    await this.categoryForm.fillCategoryForm(newName, newIcon, ""); // type is not changed here, so pass empty string or handle accordingly

    // Save changes
    await this.page.getByTestId("button-submit").click();
  }

  async updateCategoryParent(
    categoryName: string,
    newParentName: string
  ): Promise<void> {
    this.logger.info(
      `Starting updateCategoryParent with categoryName: '${categoryName}', newParentName: '${newParentName}'`
    );

    // Find the row/container that contains the category name
    const categoryRows = this.page.locator(
      '[data-testid="tree-node-content"]',
      {
        has: this.page
          .getByTestId("category-name")
          .filter({ hasText: categoryName }),
      }
    );
    const rowCount = await categoryRows.count();
    this.logger.info(
      `[DEBUG] Found ${rowCount} category rows for name: ${categoryName}`
    );
    for (let i = 0; i < rowCount; i++) {
      const rowText = await categoryRows.nth(i).textContent();
      this.logger.info(`[DEBUG] Row ${i} text:`, rowText);
    }

    // Find the edit button within that row
    const editButtons = categoryRows.getByTestId("edit-category-button");
    const editButtonCount = await editButtons.count();
    this.logger.info(
      `[DEBUG] Found ${editButtonCount} edit buttons for category: ${categoryName}`
    );
    for (let i = 0; i < editButtonCount; i++) {
      const btnText = await editButtons.nth(i).textContent();
      this.logger.info(`[DEBUG] Edit button ${i} text:`, btnText);
    }

    // Click the edit button
    await editButtons.first().click();

    // Open the parent dropdown
    await this.page
      .getByTestId("select-parent-category")
      .locator("div")
      .nth(3)
      .click();

    // Select the new parent by name
    await this.page.getByRole("option", { name: newParentName }).click();
    this.logger.info(`Selected parent "${newParentName}"`);

    // Submit the update and wait for any response (success or error)
    const [putResponse] = await Promise.all([
      this.page.waitForResponse(
        (resp) => {
          const isCategoryPut =
            resp.url().includes("/categories/") &&
            resp.request().method() === "PUT";
          this.logger.info(
            `Response intercepted: url=${resp.url()}, method=${resp
              .request()
              .method()}, status=${resp.status()}, isCategoryPut=${isCategoryPut}`
          );
          if (isCategoryPut) {
            this.logger.info(
              `Received PUT response for categories: ${resp.status()} - ${resp.url()}`
            );
          }
          return isCategoryPut;
        },
        { timeout: 10000 }
      ),
      this.page.getByTestId("button-submit").click(),
    ]);

    this.logger.info(
      `Ending updateCategoryParent with categoryName: '${categoryName}', newParentName: '${newParentName}'`
    );
  }
}
