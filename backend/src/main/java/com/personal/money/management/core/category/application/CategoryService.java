package com.personal.money.management.core.category.application;

import com.personal.money.management.core.category.application.exception.CategoryNotFoundException;
import com.personal.money.management.core.category.application.exception.CategoryCyclicDependencyException;
import com.personal.money.management.core.category.domain.CategoryFactory;
import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;
import com.personal.money.management.core.category.domain.repository.CategoryRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    private Category getParentCategory(Long parentId) {
        if (parentId == null) {
            return null;
        }
        return categoryRepository.findById(parentId);
    }

    private Category validateParentExists(Long parentId) {
        if (parentId == null) {
            return null;
        }
        Category parent = getParentCategory(parentId);
        if (parent == null) {
            throw new CategoryNotFoundException(parentId);
        }
        return parent;
    }

    private void checkCyclicDependency(Category category, Category newParent) {
        Category current = newParent;
        while (current != null) {
            if (current.getId() != null && current.getId().equals(category.getId())) {
                throw new CategoryCyclicDependencyException("Cyclic dependency detected: category cannot be its own ancestor");
            }
            current = current.getParent();
        }
    }

    @Transactional
    public Category createCategory(String name, String icon, CategoryType type, Long parentId) {
        Category parent = validateParentExists(parentId);
        Category category = CategoryFactory.createCategory(name, icon, type, parent);
        return categoryRepository.save(category);
    }

    public List<Category> getAllCategoriesSortedByName() {
        return categoryRepository.findAllSortedByName();
    }

    @Transactional
    public Category updateCategory(Long id, String name, String icon, CategoryType type, Long parentId) {
        Category category = categoryRepository.findById(id);
        if (category == null) {
            throw new CategoryNotFoundException(id);
        }
        Category parent = validateParentExists(parentId);
        checkCyclicDependency(category, parent);
        Category updatedCategory = CategoryFactory.updateCategory(id, name, icon, type, parent);
        return categoryRepository.save(updatedCategory);
    }
}
