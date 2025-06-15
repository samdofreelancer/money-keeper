package com.personal.money.management.core.category.domain.model;


public class Category {
    private Long id;
    private String name;
    private String icon;
    private CategoryType type;
    private Category parent;

    public Category(Long id, String name, String icon, CategoryType type, Category parent) {
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

    public static Category reconstruct(Long id, String name, String icon, CategoryType type, Category parent) {
        return new Category(id, name, icon, type, parent);
    }

    // equals, hashCode, toString omitted for brevity
}
