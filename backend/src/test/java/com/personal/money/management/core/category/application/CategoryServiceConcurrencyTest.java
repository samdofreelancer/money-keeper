package com.personal.money.management.core.category.application;

import com.personal.money.management.core.category.application.exception.CategoryConflictException;
import com.personal.money.management.core.category.domain.CategoryFactory;
import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;
import com.personal.money.management.core.category.domain.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.dao.OptimisticLockingFailureException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

/**
 * Concurrency tests for the CategoryService.
 * Focuses on verifying the behavior of the service under optimistic locking scenarios.
 * Uses mocks to simulate database behavior and trigger concurrency-related exceptions.
 */
public class CategoryServiceConcurrencyTest {

    private CategoryRepository categoryRepository;
    private CategoryService categoryService;

    @BeforeEach
    public void setUp() {
        categoryRepository = mock(CategoryRepository.class);
        categoryService = new CategoryService(categoryRepository);
    }

    @Test
    public void updateCategory_shouldThrowCategoryConflictException_onOptimisticLockingFailure() {
        Long categoryId = 1L;
        Category existingCategory = Category.reconstruct(categoryId, "Old Name", "old_icon", CategoryType.EXPENSE, null);
        Category parentCategory = Category.reconstruct(2L, "Parent", "parent_icon", CategoryType.EXPENSE, null);

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(existingCategory));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(parentCategory));
        when(categoryRepository.save(any(Category.class))).thenThrow(new OptimisticLockingFailureException("Optimistic lock failure"));

        assertThrows(CategoryConflictException.class, () -> {
            categoryService.updateCategory(categoryId, "New Name", "new_icon", CategoryType.INCOME, 2L);
        });

        verify(categoryRepository).findById(categoryId);
        verify(categoryRepository).findById(2L);
        verify(categoryRepository).save(any(Category.class));
    }

    /**
     * Verifies that deleting a category throws a CategoryConflictException
     * when an OptimisticLockingFailureException is thrown by the repository.
     */
    @Test
    public void deleteCategory_shouldThrowCategoryConflictException_onOptimisticLockingFailure() {
        Long categoryId = 1L;
        Category category = Category.reconstruct(categoryId, "Category1", "icon1", CategoryType.EXPENSE, null);

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(categoryRepository.findByParent(category)).thenReturn(java.util.Collections.emptyList());
        doThrow(new OptimisticLockingFailureException("Optimistic lock failure")).when(categoryRepository).deleteById(categoryId);

        assertThrows(CategoryConflictException.class, () -> {
            categoryService.deleteCategory(categoryId);
        });

        verify(categoryRepository).findById(categoryId);
        verify(categoryRepository).findByParent(category);
        verify(categoryRepository).deleteById(categoryId);
    }
}
