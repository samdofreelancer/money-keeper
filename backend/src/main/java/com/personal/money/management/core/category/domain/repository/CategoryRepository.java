package com.personal.money.management.core.category.domain.repository;

import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;

import java.util.List;

import java.util.List;

public interface CategoryRepository {
    Category save(Category category);
    Category findById(Long id);
    List<Category> findAllSortedByName();
    void deleteById(Long id);

    List<Category> findByParent(Category parent);
}
