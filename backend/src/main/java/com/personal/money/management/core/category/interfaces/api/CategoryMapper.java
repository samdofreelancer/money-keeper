package com.personal.money.management.core.category.interfaces.api;

import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.interfaces.api.dto.CategoryResponse;

public class CategoryMapper {

    public static CategoryResponse toResponse(Category category) {
        if (category == null) {
            return null;
        }
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getIcon(),
                category.getType(),
                category.getParent() != null ? category.getParent().getId() : null
        );
    }
}
