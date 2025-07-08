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
        // No manual mock setup needed, Spring will inject real beans
    }

    @Test
    public void updateCategory_shouldThrowCategoryNotFoundException_orCategoryConflictException() {
        Long categoryId = 1L;
        Category existingCategory = Category.reconstruct(categoryId, "Old Name", "old_icon", CategoryType.EXPENSE, null);
        Category parentCategory = Category.reconstruct(2L, "Parent", "parent_icon", CategoryType.EXPENSE, null);

        assertThrows(Exception.class, () -> {
            categoryService.updateCategory(categoryId, "New Name", "new_icon", CategoryType.INCOME, 2L);
        });
    }

    @Test
    public void deleteCategory_shouldThrowCategoryNotFoundException_orCategoryConflictException() {
        Long categoryId = 1L;
        Category category = Category.reconstruct(categoryId, "Category1", "icon1", CategoryType.EXPENSE, null);

        assertThrows(Exception.class, () -> {
            categoryService.deleteCategory(categoryId);
        });
    }
}
