package com.personal.money.management.core.category.infrastructure.persistence;

import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
// no unused imports

class CategoryEntityMapperTest {

    @Test
    void toEntity_handles_null_and_parent_and_preserves_version() {
        // null input -> null
        assertThat(CategoryEntityMapper.toEntity((Category) null)).isNull();

        // create domain category with parent
        Category parent = new Category("P", "pi", CategoryType.EXPENSE, null);
        Category child = new Category("C", "ci", CategoryType.INCOME, parent);

        CategoryEntity parentEntity = new CategoryEntity(10L, "P", "pi", CategoryType.EXPENSE, null, 2L);

        CategoryEntity ent = CategoryEntityMapper.toEntity(child, null, parentEntity);
        assertThat(ent).isNotNull();
        assertThat(ent.getName()).isEqualTo("C");
        assertThat(ent.getParent()).isEqualTo(parentEntity);

        // existing entity should preserve version
        CategoryEntity existing = new CategoryEntity(5L, "old", "oi", CategoryType.EXPENSE, null, 99L);
        Category update = new Category("U", "ui", CategoryType.EXPENSE, null);
        CategoryEntity updated = CategoryEntityMapper.toEntity(update, existing, null);
        assertThat(updated.getVersion()).isEqualTo(99L);
        assertThat(updated.getName()).isEqualTo("U");
    }

    @Test
    void toDomain_handles_null_and_recursion() {
        assertThat(CategoryEntityMapper.toDomain(null)).isNull();

        CategoryEntity parentEntity = new CategoryEntity(1L, "P", "pi", CategoryType.EXPENSE, null, 1L);
        CategoryEntity childEntity = new CategoryEntity(2L, "C", "ci", CategoryType.INCOME, parentEntity, 1L);

        var domain = CategoryEntityMapper.toDomain(childEntity);
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("C");
        assertThat(domain.getParent()).isNotNull();
        assertThat(domain.getParent().getName()).isEqualTo("P");
    }
}
