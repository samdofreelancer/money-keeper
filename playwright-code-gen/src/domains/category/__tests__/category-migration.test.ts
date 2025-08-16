import { test, expect } from '@playwright/test';
import { CategoryUseCase } from '../usecases/category.use-case';
import { generateTestName } from '../../../shared/utilities/category-test-helpers';

test.describe('Category Management Migration Test', () => {
  test('should create category without parent successfully', async ({ page }) => {
    const categoryUseCase = new CategoryUseCase(page);
    
    // Generate test data
    const categoryData = {
      name: generateTestName('Food'),
      icon: 'Grid',
      type: 'Expense' as const
    };
    
    // Clean up: Delete category if it already exists
    await categoryUseCase.deleteCategoryIfExists(categoryData.name);
    
    // Create a new category
    await categoryUseCase.createCategoryWithoutParent(categoryData);
    
    // Verify category display in the list
    await categoryUseCase.waitForCategoryTreeToLoad();
    const categoryExists = await categoryUseCase.verifyCategoryExists(categoryData.name);
    expect(categoryExists).toBe(true);
    
    // Delete the category
    await categoryUseCase.categoriesPage.clickDeleteCategoryButton(categoryData.name);
    await categoryUseCase.categoriesPage.clickConfirmDeleteButton();
    
    // Verify category is removed from the list
    const categoryNotExists = await categoryUseCase.verifyCategoryNotExists(categoryData.name);
    expect(categoryNotExists).toBe(true);
  });
});
