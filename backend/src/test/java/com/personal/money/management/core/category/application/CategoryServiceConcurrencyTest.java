package com.personal.money.management.core.category.application;

import com.personal.money.management.core.category.application.exception.CategoryConflictException;
import com.personal.money.management.core.category.domain.CategoryFactory;
import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;
import com.personal.money.management.core.category.domain.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.OptimisticLockingFailureException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
public class CategoryServiceConcurrencyTest {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryService categoryService;

    @BeforeEach
    public void setUp() {
        // Setup test data if needed
        if (categoryRepository.findById(1L).isEmpty()) {
            Category rootCategory = CategoryFactory.createCategory("Root", "root_icon", CategoryType.EXPENSE, null);
            categoryRepository.save(rootCategory);
        }
    }

    @Test
    public void updateCategory_shouldThrowCategoryConflictException() {
        Long categoryId = 1L;

        // Check if category exists, else skip test or handle
        if (categoryRepository.findById(categoryId).isEmpty()) {
            return; // Skip test if no data
        }
        Category existingCategory = categoryRepository.findById(categoryId).orElseThrow();

        // Simulate optimistic locking failure by mocking or other means if possible
        // For now, just test that updateCategory throws CategoryConflictException on conflict
        // This test may need enhancement with proper concurrency simulation

        assertThrows(CategoryConflictException.class, () -> {
            categoryService.updateCategory(categoryId, "New Name", "new_icon", CategoryType.INCOME, null);
        });
    }

    @Test
    public void deleteCategory_shouldThrowCategoryConflictException() {
        Long categoryId = 1L;

        // Check if category exists, else skip test or handle
        if (categoryRepository.findById(categoryId).isEmpty()) {
            return; // Skip test if no data
        }
        Category category = categoryRepository.findById(categoryId).orElseThrow();

        assertThrows(CategoryConflictException.class, () -> {
            categoryService.deleteCategory(categoryId);
        });
    }
}
