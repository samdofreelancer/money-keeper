package com.personal.money.management.core.category.interfaces.api.dto;

import com.personal.money.management.core.category.domain.model.CategoryType;

public class CategoryResponse {
    private Long id;
    private String name;
    private String icon;
    private CategoryType type;
    private Long parentId;

    public CategoryResponse(Long id, String name, String icon, CategoryType type, Long parentId) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.type = type;
        this.parentId = parentId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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