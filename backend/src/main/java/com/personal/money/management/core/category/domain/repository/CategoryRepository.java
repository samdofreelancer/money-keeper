package com.personal.money.management.core.category.domain.repository;

import com.personal.money.management.core.category.domain.model.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository {
    Category save(Category category);
    Optional<Category> findById(Long id);
    List<Category> findAllSortedByName();
    void deleteById(Long id);

    List<Category> findByParent(Category parent);
    Optional<Category> findByName(String name);
}
