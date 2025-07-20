export interface CategoryUiPort {
  navigateToCategoryPage(): Promise<void>;
  createCategory(
    name: string,
    icon: string,
    type: string,
    parent?: string,
    expectError?: boolean
  ): Promise<string | void>;
  createUniqueCategory(
    name: string,
    icon: string,
    type: string,
    parent?: string,
    expectError?: boolean
  ): Promise<string | void>;
  isCategoryCreated(name: string): Promise<boolean>;
  isCategoryChildOf(childName: string, parentName: string): Promise<boolean>;
  createCategoryWithDuplicateName(
    name: string,
    icon: string,
    type: string
  ): Promise<void>;
  updateCategoryParent(
    categoryName: string,
    newParentName: string
  ): Promise<void>;
  updateCategoryNameAndIcon(
    oldName: string,
    newName: string,
    newIcon: string
  ): Promise<void>;
  deleteCategory(name: string): Promise<void>;
  isErrorMessageVisible(message: string): Promise<boolean>;
  isErrorMessageVisibleInErrorBox(message: string): Promise<boolean>;
  waitForToastMessage(message: string, timeout?: number): Promise<boolean>;
  listCategories(): Promise<string[]>;
  assertOnCategoryPage(): Promise<void>;
}
