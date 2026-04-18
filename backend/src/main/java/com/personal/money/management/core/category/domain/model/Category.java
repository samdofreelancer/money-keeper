package com.personal.money.management.core.category.domain.model;

import com.personal.money.management.core.shared.domain.AggregateRoot;

/**
 * Aggregate Root representing a transaction category.
 *
 * <p>Responsibilities:</p>
 * <ul>
 *   <li>Maintains category identity and state</li>
 *   <li>Manages category metadata (name, icon, type)</li>
 *   <li>Supports hierarchical category structure</li>
 *   <li>Ensures consistency within the category aggregate</li>
 * </ul>
 *
 * <p>Business Rules:</p>
 * <ul>
 *   <li>Category cannot be its own parent (cyclic dependency prevention)</li>
 *   <li>Categories can be organized hierarchically for better classification</li>
 *   <li>Different types have specific semantics (Income, Expense, etc.)</li>
 * </ul>
 */
@AggregateRoot(
    boundedContext = "category",
    description = "Manages transaction categories - Income, Expense, and custom categories. Supports hierarchy and ensures consistency."
)
public class Category {
    private final Long id;
    private String name;
    private String icon;
    private CategoryType type;
    private Category parent;

    public Category(String name, String icon, CategoryType type, Category parent) {
        this.id = null; // ID is null for new entities
        this.name = name;
        this.icon = icon;
        this.type = type;
        this.setParent(parent);
    }

    private Category(Long id, String name, String icon, CategoryType type, Category parent) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.type = type;
        this.parent = parent;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getIcon() { return icon; }
    public CategoryType getType() { return type; }
    public Category getParent() { return parent; }

    public void update(String name, String icon, CategoryType type) {
        this.name = name;
        this.icon = icon;
        this.type = type;
    }

    public void setParent(Category parent) {
        if (this.equals(parent)) {
            throw new IllegalArgumentException("A category cannot be its own parent.");
        }
        this.parent = parent;
    }

    public static Category reconstruct(Long id, String name, String icon, CategoryType type, Category parent) {
        return new Category(id, name, icon, type, parent);
    }

    // equals, hashCode, toString omitted for brevity
}
