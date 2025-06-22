package com.personal.money.management.core.category.interfaces.api;

import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;
import com.personal.money.management.core.category.interfaces.api.dto.CategoryResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CategoryMapperTest {

    @Test
    void toResponse_shouldReturnNull_whenCategoryIsNull() {
        CategoryResponse response = CategoryMapper.toResponse(null);
        assertNull(response, "Expected null response when input category is null");
    }

    @Test
    void toResponse_shouldMapFieldsCorrectly_whenCategoryIsNotNull() {
        Category parent = Category.reconstruct(1L, "Parent", "parent_icon", CategoryType.EXPENSE, null);

        Category category = Category.reconstruct(2L, "Test Category", "test_icon", CategoryType.INCOME, parent);

        CategoryResponse response = CategoryMapper.toResponse(category);

        assertNotNull(response);
        assertEquals(category.getId(), response.getId());
        assertEquals(category.getName(), response.getName());
        assertEquals(category.getIcon(), response.getIcon());
        assertEquals(category.getType(), response.getType());
        assertEquals(parent.getId(), response.getParentId());
    }
}
