package com.personal.money.management.core.category.interfaces.api.dto;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

public class BulkDeleteCategoryRequest {
    @NotNull(message = "Category IDs list cannot be null")
    @NotEmpty(message = "Category IDs list cannot be empty")
    @Size(max = 100, message = "Cannot delete more than 100 categories at once")
    private List<@NotNull(message = "Category ID cannot be null") Long> categoryIds;

    public List<Long> getCategoryIds() {
        return categoryIds;
    }

    public void setCategoryIds(List<Long> categoryIds) {
        this.categoryIds = categoryIds;
    }
}
