package com.personal.money.management.core.category.interfaces.api;

import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.interfaces.api.dto.CategoryResponse;

public class CategoryMapper {

    public static CategoryResponse toResponse(Category category) {
        if (category == null) {
            return null;
        }
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setIcon(category.getIcon());
        response.setType(category.getType());
        response.setParentId(category.getParent() != null ? category.getParent().getId() : null);
        return response;
    }
}
