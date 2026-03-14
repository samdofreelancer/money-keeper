package com.personal.money.management.core.category.infrastructure.persistence;

import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.repository.CategoryRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CategoryRepositoryImpl implements CategoryRepository {
    private final CategoryJpaRepository jpaRepository;

    public CategoryRepositoryImpl(CategoryJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Category save(Category category) {
        if (category == null) {
            return null;
        }
        CategoryEntity existingEntity = null;
        if (category.getId() != null) {
            existingEntity = jpaRepository.findById(category.getId()).orElse(null);
        }
        CategoryEntity parentEntity = null;
        if (category.getParent() != null && category.getParent().getId() != null) {
            parentEntity = jpaRepository.findById(category.getParent().getId()).orElse(null);
        }
        CategoryEntity entity = CategoryEntityMapper.toEntity(category, existingEntity, parentEntity);
        CategoryEntity saved = jpaRepository.save(entity);
        return CategoryEntityMapper.toDomain(saved);
    }

    @Override
    public Optional<Category> findById(Long id) {
        return jpaRepository.findById(id)
                .map(CategoryEntityMapper::toDomain);
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
        if (parentEntity != null && parentEntity.getId() != null) {
            parentEntity = jpaRepository.findById(parentEntity.getId()).orElse(null);
        }
        return jpaRepository.findByParent(parentEntity).stream()
                .map(CategoryEntityMapper::toDomain)
                .toList();
    }

    @Override
    public Optional<Category> findByName(String name) {
        CategoryEntity entity = jpaRepository.findByName(name);
        return Optional.ofNullable(entity).map(CategoryEntityMapper::toDomain);
    }
}
