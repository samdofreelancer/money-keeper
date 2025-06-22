package com.personal.money.management.core.category.domain.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CategoryTest {
    @Test
    void categoryPropertiesShouldBeSetCorrectlyOnCreation() {
        Category parent = new Category("Parent", "parent_icon", CategoryType.EXPENSE, null);
        Category category = new Category("Child", "child_icon", CategoryType.INCOME, parent);

        assertNull(category.getId());
        assertEquals("Child", category.getName());
        assertEquals("child_icon", category.getIcon());
        assertEquals(CategoryType.INCOME, category.getType());
        assertEquals(parent, category.getParent());
    }

    @Test
    void categoryShouldBeUpdatable() {
        Category category = new Category("Initial", "initial_icon", CategoryType.EXPENSE, null);
        category.update("Updated", "updated_icon", CategoryType.INCOME);

        assertEquals("Updated", category.getName());
        assertEquals("updated_icon", category.getIcon());
        assertEquals(CategoryType.INCOME, category.getType());
    }

    @Test
    void aCategoryCannotBeItsOwnParent() {
        Category category = new Category("Self-parenting", "icon", CategoryType.EXPENSE, null);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            category.setParent(category);
        });

        assertEquals("A category cannot be its own parent.", exception.getMessage());
    }

    @Test
    void categoryWithoutParentShouldHaveNullParent() {
        Category category = new Category("Orphan", "orphan_icon", CategoryType.EXPENSE, null);
        assertNull(category.getParent());
    }
}
