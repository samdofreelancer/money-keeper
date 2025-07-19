export interface CategoryUiPort {
  navigateToCategoryPage(): Promise<void>;
  createCategory(name: string, icon: string, type: string, parent?: string): Promise<string>;
  createUniqueCategory(name: string, icon: string, type: string, parent?: string): Promise<string>;
  isCategoryCreated(name: string): Promise<boolean>;
  isCategoryChildOf(childName: string, parentName: string): Promise<boolean>;
  createCategoryWithDuplicateName(name: string, icon: string, type: string): Promise<void>;
  updateCategoryParent(categoryName: string, newParentName: string): Promise<void>;
  deleteCategory(name: string): Promise<void>;
  isErrorMessageVisible(message: string): Promise<boolean>;
  listCategories(): Promise<string[]>;
}
