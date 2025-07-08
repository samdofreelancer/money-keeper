package com.personal.money.management.core.category.application;

import com.personal.money.management.core.category.application.exception.CategoryNotFoundException;
import com.personal.money.management.core.category.application.exception.CategoryCyclicDependencyException;
import com.personal.money.management.core.category.application.exception.CategoryConflictException;
import com.personal.money.management.core.category.application.exception.CategoryHasChildException;
import com.personal.money.management.core.category.domain.CategoryFactory;
import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;
import com.personal.money.management.core.category.domain.repository.CategoryRepository;
import com.personal.money.management.core.category.infrastructure.persistence.IconRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

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
        IconRepository iconRepository = mock(IconRepository.class);
        categoryService = new CategoryService(categoryRepository, iconRepository);
    }

    @Test
    void createCategory_shouldSaveAndReturnCategory() {
        String name = "Food";
        String icon = "food_icon";
        CategoryType type = CategoryType.EXPENSE;
        Long parentId = 1L;
        Category parent = new Category("Parent", "parent_icon", type, null);
        Category savedCategory = Category.reconstruct(2L, name, icon, type, parent);

        when(categoryRepository.findById(parentId)).thenReturn(Optional.of(parent));
        when(categoryRepository.save(any(Category.class))).thenReturn(savedCategory);

        Category result = categoryService.createCategory(name, icon, type, parentId);

        assertNotNull(result);
        assertEquals(name, result.getName());
        assertEquals(icon, result.getIcon());
        assertEquals(type, result.getType());
        assertEquals(parent, result.getParent());
        assertEquals(2L, result.getId());

        ArgumentCaptor<Category> captor = ArgumentCaptor.forClass(Category.class);
        verify(categoryRepository).save(captor.capture());
        Category toSave = captor.getValue();
        assertEquals(name, toSave.getName());
        assertEquals(icon, toSave.getIcon());
        assertEquals(type, toSave.getType());
        assertEquals(parent, toSave.getParent());
    }

    @Test
    void createCategory_withParent_shouldSetParent() {
        String name = "Snacks";
        String icon = "snack_icon";
        CategoryType type = CategoryType.EXPENSE;
        Long parentId = 2L;
        Category parent = new Category("Food", "food_icon", type, null);

        when(categoryRepository.findById(parentId)).thenReturn(Optional.of(parent));
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Category result = categoryService.createCategory(name, icon, type, parentId);

        assertNotNull(result);
        assertEquals(parent, result.getParent());
    }

    @Test
    void getAllCategoriesSortedByName_shouldReturnSortedCategories() {
        Category category1 = Category.reconstruct(1L, "B", "iconB", CategoryType.EXPENSE, null);
        Category category2 = Category.reconstruct(2L, "A", "iconA", CategoryType.EXPENSE, null);
        Category category3 = Category.reconstruct(3L, "C", "iconC", CategoryType.EXPENSE, null);

        when(categoryRepository.findAllSortedByName()).thenReturn(List.of(category2, category1, category3));

        List<Category> result = categoryService.getAllCategoriesSortedByName();

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
        Category existingCategory = spy(new Category("Old Name", "old_icon", CategoryType.EXPENSE, null));
        Category parentCategory = new Category("Parent", "parent_icon", CategoryType.EXPENSE, null);

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(existingCategory));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(parentCategory));
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Category updatedCategory = categoryService.updateCategory(categoryId, "New Name", "new_icon", CategoryType.INCOME, 2L);

        assertNotNull(updatedCategory);
        verify(existingCategory).update("New Name", "new_icon", CategoryType.INCOME);
        verify(existingCategory).setParent(parentCategory);
        verify(categoryRepository).save(existingCategory);
    }

    @Test
    void updateCategory_shouldThrowExceptionIfCategoryNotFound() {
        Long categoryId = 1L;
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        CategoryNotFoundException exception = assertThrows(CategoryNotFoundException.class, () -> {
            categoryService.updateCategory(categoryId, "Name", "icon", CategoryType.EXPENSE, null);
        });

        assertEquals("Category not found with id: " + categoryId, exception.getMessage());
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void createCategory_shouldThrowExceptionIfParentNotFound() {
        String name = "Invalid Parent Category";
        String icon = "icon";
        CategoryType type = CategoryType.EXPENSE;
        Long invalidParentId = 999L;

        when(categoryRepository.findById(invalidParentId)).thenReturn(Optional.empty());

        CategoryNotFoundException exception = assertThrows(CategoryNotFoundException.class, () -> {
            categoryService.createCategory(name, icon, type, invalidParentId);
        });

        assertEquals("Parent category not found with id: " + invalidParentId, exception.getMessage());
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void updateCategory_shouldThrowExceptionIfParentNotFound() {
        Long categoryId = 1L;
        Long invalidParentId = 999L;
        Category existingCategory = new Category("Old Name", "old_icon", CategoryType.EXPENSE, null);

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(existingCategory));
        when(categoryRepository.findById(invalidParentId)).thenReturn(Optional.empty());

        CategoryNotFoundException exception = assertThrows(CategoryNotFoundException.class, () -> {
            categoryService.updateCategory(categoryId, "New Name", "new_icon", CategoryType.INCOME, invalidParentId);
        });

        assertEquals("Parent category not found with id: " + invalidParentId, exception.getMessage());
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void updateCategory_shouldThrowExceptionIfCyclicDependency() {
        Long categoryId = 1L;
        Long parentId = 2L;

        Category category = Category.reconstruct(categoryId, "Category1", "icon1", CategoryType.EXPENSE, null);
        Category parent = Category.reconstruct(parentId, "Category2", "icon2", CategoryType.EXPENSE, category); // cyclic parent

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(categoryRepository.findById(parentId)).thenReturn(Optional.of(parent));

        assertThrows(CategoryCyclicDependencyException.class, () -> {
            categoryService.updateCategory(categoryId, "name", "icon", CategoryType.EXPENSE, parentId);
        });
    }

    @Test
    void deleteCategory_shouldDeleteCategorySuccessfully() {
        Long categoryId = 1L;
        Category category = new Category("Category1", "icon1", CategoryType.EXPENSE, null);

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(categoryRepository.findByParent(category)).thenReturn(Collections.emptyList());
        doNothing().when(categoryRepository).deleteById(categoryId);

        assertDoesNotThrow(() -> categoryService.deleteCategory(categoryId));

        verify(categoryRepository).findById(categoryId);
        verify(categoryRepository).findByParent(category);
        verify(categoryRepository).deleteById(categoryId);
    }

    @Test
    void deleteCategory_shouldThrowExceptionIfCategoryNotFound() {
        Long categoryId = 1L;

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        CategoryNotFoundException exception = assertThrows(CategoryNotFoundException.class, () -> {
            categoryService.deleteCategory(categoryId);
        });

        assertEquals("Category not found with id: " + categoryId, exception.getMessage());
        verify(categoryRepository).findById(categoryId);
        verify(categoryRepository, never()).deleteById(any());
    }

    @Test
    void deleteCategory_shouldThrowExceptionIfCategoryHasChildren() {
        Long categoryId = 1L;
        Category category = Category.reconstruct(categoryId, "Category1", "icon1", CategoryType.EXPENSE, null);
        Category childCategory = new Category("ChildCategory", "icon2", CategoryType.EXPENSE, category);

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(categoryRepository.findByParent(category)).thenReturn(List.of(childCategory));

        CategoryHasChildException exception = assertThrows(CategoryHasChildException.class, () -> {
            categoryService.deleteCategory(categoryId);
        });

        assertEquals("Cannot delete category with child categories. Category id: " + categoryId, exception.getMessage());
        verify(categoryRepository).findById(categoryId);
        verify(categoryRepository).findByParent(category);
        verify(categoryRepository, never()).deleteById(any());
    }
}
