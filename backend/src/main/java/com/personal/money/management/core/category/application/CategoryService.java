package com.personal.money.management.core.category.application;

import com.personal.money.management.core.category.application.exception.CategoryNotFoundException;
import com.personal.money.management.core.category.application.exception.CategoryCyclicDependencyException;
import com.personal.money.management.core.category.application.exception.CategoryConflictException;
import com.personal.money.management.core.category.application.exception.CategoryHasChildException;
import com.personal.money.management.core.category.domain.CategoryFactory;
import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;
import com.personal.money.management.core.category.domain.repository.CategoryRepository;

import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

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
        return categoryRepository.findById(parentId)
                .orElseThrow(() -> new CategoryNotFoundException("Parent category not found with id: " + parentId));
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
        if (categoryRepository.findByName(name).isPresent()) {
            throw new CategoryConflictException("Category name already exists");
        }
        Category parent = getParentCategory(parentId);
        Category category = CategoryFactory.createCategory(name, icon, type, parent);
        return categoryRepository.save(category);
    }

    public List<Category> getAllCategoriesSortedByName() {
        return categoryRepository.findAllSortedByName();
    }

    @Transactional
    public Category updateCategory(Long id, String name, String icon, CategoryType type, Long parentId) {
        try {
            Category category = categoryRepository.findById(id)
                    .orElseThrow(() -> new CategoryNotFoundException(id));

            categoryRepository.findByName(name).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new CategoryConflictException("Category name already exists");
                }
            });

            Category parent = getParentCategory(parentId);
            checkCyclicDependency(category, parent);

            category.update(name, icon, type);
            category.setParent(parent);

            return categoryRepository.save(category);
        } catch (OptimisticLockingFailureException e) {
            throw new CategoryConflictException("Category update failed due to concurrent modification. Please retry.", e);
        }
    }

    @Transactional
    public void deleteCategory(Long id) {
        try {
            Category category = categoryRepository.findById(id)
                    .orElseThrow(() -> new CategoryNotFoundException(id));
            var children = categoryRepository.findByParent(category);
            if (!children.isEmpty()) {
                throw new CategoryHasChildException(id);
            }
            categoryRepository.deleteById(id);
        } catch (OptimisticLockingFailureException e) {
            throw new CategoryConflictException("Category delete failed due to concurrent modification. Please retry.", e);
        }
    }

    @Transactional
    public void bulkDeleteCategories(List<Long> categoryIds) {
        try {
            // Collect all categories to delete including descendants
            List<Category> allCategoriesToDelete = new ArrayList<>();
            Set<Long> processedIds = new HashSet<>();

            for (Long categoryId : categoryIds) {
                if (!processedIds.contains(categoryId)) {
                    Category category = categoryRepository.findById(categoryId)
                            .orElseThrow(() -> new CategoryNotFoundException(categoryId));

                    // Get all descendants in deletion order (children first)
                    List<Category> descendants = getDescendantsInDeletionOrder(category);
                    allCategoriesToDelete.addAll(descendants);
                    allCategoriesToDelete.add(category);

                    // Mark as processed
                    processedIds.add(categoryId);
                    processedIds.addAll(descendants.stream().map(Category::getId).collect(Collectors.toSet()));
                }
            }

            // De-duplicate by ID while preserving order (children first)
            List<Category> uniqueCategoriesToDelete = new ArrayList<>();
            Set<Long> seenIds = new HashSet<>();
            for (Category category : allCategoriesToDelete) {
                if (seenIds.add(category.getId())) {
                    uniqueCategoriesToDelete.add(category);
                }
            }

            // Delete in correct order (children first)
            for (Category category : uniqueCategoriesToDelete) {
                categoryRepository.deleteById(category.getId());
            }
        } catch (OptimisticLockingFailureException e) {
            throw new CategoryConflictException("Bulk category delete failed due to concurrent modification. Please retry.", e);
        }
    }

    private List<Category> getDescendantsInDeletionOrder(Category category) {
        List<Category> descendants = new ArrayList<>();
        List<Category> children = categoryRepository.findByParent(category);

        for (Category child : children) {
            // Recursively get descendants of this child
            descendants.addAll(getDescendantsInDeletionOrder(child));
        }

        // Add children after their descendants
        descendants.addAll(children);
        return descendants;
    }
}
