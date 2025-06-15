package com.personal.money.management.core.category.application;

import com.personal.money.management.core.category.application.exception.CategoryNotFoundException;
import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;
import com.personal.money.management.core.category.domain.repository.CategoryRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public Category createCategory(String name, String icon, CategoryType type, Long parentId) {
        Category parent = null;
        if (parentId != null) {
            parent = categoryRepository.findById(parentId);
        }
        Category category = new Category(null, name, icon, type, parent);
        return categoryRepository.save(category);
    }

    public List<Category> getAllCategoriesSortedByName() {
        return categoryRepository.findAllSortedByName();
    }

    public Category updateCategory(Long id, String name, String icon, CategoryType type, Long parentId) {
        Category category = categoryRepository.findById(id);
        if (category == null) {
            throw new CategoryNotFoundException(id);
        }
        Category parent = null;
        if (parentId != null) {
            parent = categoryRepository.findById(parentId);
        }
        Category updatedCategory = Category.reconstruct(category.getId(), name, icon, type, parent);
        return categoryRepository.save(updatedCategory);
    }
}
