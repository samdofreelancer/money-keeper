import { log } from "console";
import { CategoryUiPort } from "../../domain/ports/category-ui.port";
import { logger } from "../../../../shared";

export class CategoryUseCasesFactory {
  private categoryUiPort: CategoryUiPort;

  constructor(categoryUiPort: CategoryUiPort) {
    this.categoryUiPort = categoryUiPort;
  }

  async createCategory(name: string, icon: string, type: string, parent?: string): Promise<void> {
    await this.categoryUiPort.navigateToCategoryPage();
    await this.categoryUiPort.createCategory(name, icon, type, parent);
  }

  async createUniqueCategory(name: string, icon: string, type: string, parent?: string): Promise<string> {
    logger.info(`Creating unique category with icon: ${icon}, type: ${type}, parent: ${parent}`);
    await this.categoryUiPort.navigateToCategoryPage();
    return await this.categoryUiPort.createUniqueCategory(name, icon, type, parent);
  }

  async isCategoryCreated(name: string): Promise<boolean> {
    return await this.categoryUiPort.isCategoryCreated(name);
  }

  async isCategoryChildOf(childName: string, parentName: string): Promise<boolean> {
    return await this.categoryUiPort.isCategoryChildOf(childName, parentName);
  }

  async createCategoryWithDuplicateName(name: string, icon: string, type: string): Promise<void> {
    await this.categoryUiPort.createCategoryWithDuplicateName(name, icon, type);
  }

  async updateCategoryParent(categoryName: string, newParentName: string): Promise<void> {
    await this.categoryUiPort.updateCategoryParent(categoryName, newParentName);
  }

  async deleteCategory(name: string): Promise<void> {
    await this.categoryUiPort.deleteCategory(name);
  }

  async isErrorMessageVisible(message: string): Promise<boolean> {
    return await this.categoryUiPort.isErrorMessageVisible(message);
  }

  async listCategories(): Promise<string[]> {
    return await this.categoryUiPort.listCategories();
  }
}
