package com.personal.money.management.core.category.infrastructure.persistence;

import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.repository.CategoryRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.List;

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

    @Override
    public List<Category> findAllSortedByName() {
        return jpaRepository.findAll(Sort.by("name")).stream()
                .map(CategoryEntityMapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public List<Category> findByParent(Category parent) {
        var parentEntity = CategoryEntityMapper.toEntity(parent);
        return jpaRepository.findByParent(parentEntity).stream()
                .map(CategoryEntityMapper::toDomain)
                .toList();
    }
}
