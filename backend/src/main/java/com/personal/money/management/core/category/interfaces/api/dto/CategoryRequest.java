package com.personal.money.management.core.category.interfaces.api.dto;

import com.personal.money.management.core.category.domain.model.CategoryType;
import lombok.Data;
import lombok.EqualsAndHashCode;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@EqualsAndHashCode(callSuper = true)
public class CategoryRequest extends AbstractCategoryDto {
    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 50)
    private String icon;

    @NotNull
    private CategoryType type;

    // parentId is inherited from AbstractCategoryDto
}
