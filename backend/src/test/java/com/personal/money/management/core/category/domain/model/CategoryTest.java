package com.personal.money.management.core.category.domain.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CategoryTest {
    @Test
    void categoryPropertiesShouldBeSetCorrectly() {
        Category parent = new Category(2L, "Parent", "parent_icon", CategoryType.EXPENSE, null);
        Category category = new Category(1L, "Child", "child_icon", CategoryType.INCOME, parent);

        assertEquals(1L, category.getId());
        assertEquals("Child", category.getName());
        assertEquals("child_icon", category.getIcon());
        assertEquals(CategoryType.INCOME, category.getType());
        assertEquals(parent, category.getParent());
    }

    @Test
    void categoryWithoutParentShouldHaveNullParent() {
        Category category = new Category(3L, "Orphan", "orphan_icon", CategoryType.EXPENSE, null);
        assertNull(category.getParent());
    }
}
