package com.personal.money.management.core.category.infrastructure.persistence;

import com.personal.money.management.core.category.domain.model.Category;

public class CategoryEntityMapper {

    public static CategoryEntity toEntity(Category category, CategoryEntity existingEntity, CategoryEntity parentEntity) {
        if (category == null) return null;
        if (existingEntity == null) {
            existingEntity = new CategoryEntity();
        }
        existingEntity.setId(category.getId());
        existingEntity.setName(category.getName());
        existingEntity.setIcon(category.getIcon());
        existingEntity.setType(category.getType());
        existingEntity.setParent(parentEntity);
        // Preserve version field by not modifying it here
        return existingEntity;
    }

    public static CategoryEntity toEntity(Category category) {
        return toEntity(category, null, null);
    }

    public static Category toDomain(CategoryEntity entity) {
        if (entity == null) return null;
        return Category.reconstruct(
            entity.getId(),
            entity.getName(),
            entity.getIcon(),
            entity.getType(),
            toDomain(entity.getParent())
        );
    }
}
