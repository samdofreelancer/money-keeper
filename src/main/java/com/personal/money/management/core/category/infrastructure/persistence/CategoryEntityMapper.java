package com.personal.money.management.core.category.infrastructure.persistence;

import com.personal.money.management.core.category.domain.model.Category;

public class CategoryEntityMapper {
    public static CategoryEntity toEntity(Category category) {
        if (category == null) return null;
        CategoryEntity entity = new CategoryEntity();
        entity.setId(category.getId());
        entity.setName(category.getName());
        entity.setIcon(category.getIcon());
        entity.setType(category.getType());
        entity.setParent(category.getParent() != null ? toEntity(category.getParent()) : null);
        return entity;
    }

    public static Category toDomain(CategoryEntity entity) {
        if (entity == null) return null;
        return new Category(
            entity.getId(),
            entity.getName(),
            entity.getIcon(),
            entity.getType(),
            toDomain(entity.getParent())
        );
    }
}
