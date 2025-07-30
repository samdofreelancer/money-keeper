import { When, Then, Given } from "@cucumber/cucumber";

Given(
  "categories {string}, {string}, and {string} exist",
  async function (n1, n2, n3) {
    await this.getCategoryUseCase().createCategory(n1, "", "expense");
    await this.getCategoryUseCase().createCategory(n2, "", "income");
    await this.getCategoryUseCase().createCategory(n3, "", "expense");
  }
);

When("I list all categories", async function () {
  this.categories = await this.getCategoryUseCase().listCategories();
});

Then(
  "I should see {string}, {string}, and {string} in the category list",
  async function (n1, n2, n3) {
    const names = this.categories || [];
    if (![n1, n2, n3].every((n) => names.includes(n))) {
      throw new Error(
        `Expected to see ${n1}, ${n2}, and ${n3} in the category list`
      );
    }
  }
);
