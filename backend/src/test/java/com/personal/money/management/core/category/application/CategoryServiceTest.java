package com.personal.money.management.core.category.application;

import com.personal.money.management.core.category.application.exception.CategoryNotFoundException;
import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;
import com.personal.money.management.core.category.domain.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CategoryService.
 * Focuses on business logic with mocked dependencies.
 * Persistence and integration tested separately.
 */
class CategoryServiceTest {
    private CategoryRepository categoryRepository;
    private CategoryService categoryService;

    @BeforeEach
    void setUp() {
        categoryRepository = mock(CategoryRepository.class);
        categoryService = new CategoryService(categoryRepository);
    }

    @Test
    void createCategory_shouldSaveAndReturnCategory() {
        String name = "Food";
        String icon = "food_icon";
        CategoryType type = CategoryType.EXPENSE;
        Long parentId = null;

        Category savedCategory = new Category(1L, name, icon, type, null);
        when(categoryRepository.save(any(Category.class))).thenReturn(savedCategory);

        Category result = categoryService.createCategory(name, icon, type, parentId);

        assertNotNull(result);
        assertEquals(name, result.getName());
        assertEquals(icon, result.getIcon());
        assertEquals(type, result.getType());
        assertNull(result.getParent());
        assertEquals(1L, result.getId());

        ArgumentCaptor<Category> captor = ArgumentCaptor.forClass(Category.class);
        verify(categoryRepository).save(captor.capture());
        Category toSave = captor.getValue();
        assertEquals(name, toSave.getName());
        assertEquals(icon, toSave.getIcon());
        assertEquals(type, toSave.getType());
        assertNull(toSave.getParent());
    }

    @Test
    void createCategory_withParent_shouldSetParent() {
        String name = "Snacks";
        String icon = "snack_icon";
        CategoryType type = CategoryType.EXPENSE;
        Long parentId = 2L;
        Category parent = new Category(parentId, "Food", "food_icon", type, null);
        when(categoryRepository.findById(parentId)).thenReturn(parent);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Category result = categoryService.createCategory(name, icon, type, parentId);

        assertNotNull(result);
        assertEquals(parent, result.getParent());
    }

    @Test
    void getAllCategoriesSortedByName_shouldReturnSortedCategories() {
        Category category1 = new Category(1L, "B", "iconB", CategoryType.EXPENSE, null);
        Category category2 = new Category(2L, "A", "iconA", CategoryType.EXPENSE, null);
        Category category3 = new Category(3L, "C", "iconC", CategoryType.EXPENSE, null);

        when(categoryRepository.findAllSortedByName()).thenReturn(java.util.List.of(category2, category1, category3));

        java.util.List<Category> result = categoryService.getAllCategoriesSortedByName();

        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("A", result.get(0).getName());
        assertEquals("B", result.get(1).getName());
        assertEquals("C", result.get(2).getName());

        verify(categoryRepository).findAllSortedByName();
    }

    @Test
    void updateCategory_shouldUpdateAndSaveCategory() {
        Long categoryId = 1L;
        Category existingCategory = new Category(categoryId, "Old Name", "old_icon", CategoryType.EXPENSE, null);
        Category parentCategory = new Category(2L, "Parent", "parent_icon", CategoryType.EXPENSE, null);

        when(categoryRepository.findById(categoryId)).thenReturn(existingCategory);
        when(categoryRepository.findById(2L)).thenReturn(parentCategory);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Category updatedCategory = categoryService.updateCategory(categoryId, "New Name", "new_icon", CategoryType.INCOME, 2L);

        assertNotNull(updatedCategory);
        assertEquals(categoryId, updatedCategory.getId());
        assertEquals("New Name", updatedCategory.getName());
        assertEquals("new_icon", updatedCategory.getIcon());
        assertEquals(CategoryType.INCOME, updatedCategory.getType());
        assertEquals(parentCategory, updatedCategory.getParent());

        ArgumentCaptor<Category> captor = ArgumentCaptor.forClass(Category.class);
        verify(categoryRepository).save(captor.capture());
        Category savedCategory = captor.getValue();
        assertEquals("New Name", savedCategory.getName());
    }

    @Test
    void updateCategory_shouldThrowExceptionIfCategoryNotFound() {
        Long categoryId = 1L;
        when(categoryRepository.findById(categoryId)).thenReturn(null);

        CategoryNotFoundException exception = assertThrows(CategoryNotFoundException.class, () -> {
            categoryService.updateCategory(categoryId, "Name", "icon", CategoryType.EXPENSE, null);
        });

        assertEquals("Category not found with id: " + categoryId, exception.getMessage());
        verify(categoryRepository, never()).save(any());
    }
}
