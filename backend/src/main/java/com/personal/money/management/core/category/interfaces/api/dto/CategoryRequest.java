package com.personal.money.management.core.category.interfaces.api.dto;

import com.personal.money.management.core.category.domain.model.CategoryType;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class CategoryRequest {
    @NotBlank
    private String name;
    private String icon;
    @NotNull
    private CategoryType type;
    private Long parentId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public CategoryType getType() {
        return type;
    }

    public void setType(CategoryType type) {
        this.type = type;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }
}