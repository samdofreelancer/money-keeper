package com.personal.money.management.core.category.domain.repository;

import com.personal.money.management.core.category.domain.model.Category;

public interface CategoryRepository {
    Category save(Category category);
    Category findById(Long id);
}