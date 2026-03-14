package com.personal.money.management.core.category.domain;

import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;

public class CategoryFactory {

    public static Category createCategory(String name, String icon, CategoryType type, Category parent) {
        return new Category(name, icon, type, parent);
    }
}
