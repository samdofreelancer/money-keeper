package com.personal.money.management.core.category.infrastructure.persistence;

import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.repository.CategoryRepository;
import org.springframework.stereotype.Repository;

@Repository
public class CategoryRepositoryImpl implements CategoryRepository {
    private final CategoryJpaRepository jpaRepository;

    public CategoryRepositoryImpl(CategoryJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Category save(Category category) {
        CategoryEntity entity = CategoryEntityMapper.toEntity(category);
        CategoryEntity saved = jpaRepository.save(entity);
        return CategoryEntityMapper.toDomain(saved);
    }

    @Override
    public Category findById(Long id) {
        return jpaRepository.findById(id)
                .map(CategoryEntityMapper::toDomain)
                .orElse(null);
    }
}
