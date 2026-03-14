package com.personal.money.management.core.category.interfaces.api.dto;

import com.personal.money.management.core.category.domain.model.CategoryType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class AbstractCategoryDto {
    private String name;
    private String icon;
    private CategoryType type;
    private Long parentId;
}
