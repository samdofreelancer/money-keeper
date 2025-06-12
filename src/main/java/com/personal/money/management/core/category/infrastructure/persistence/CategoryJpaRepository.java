package com.personal.money.management.core.category.infrastructure.persistence;

import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;
import com.personal.money.management.core.category.domain.repository.CategoryRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.persistence.*;

@Repository
public interface CategoryJpaRepository extends JpaRepository<CategoryEntity, Long> {}

class CategoryEntityMapper {
    public static CategoryEntity toEntity(Category category) {
        if (category == null) return null;
        CategoryEntity entity = new CategoryEntity();
        entity.setId(category.getId());
        entity.setName(category.getName());
        entity.setIcon(category.getIcon());
        entity.setType(category.getType());
        entity.setParent(category.getParent() != null ? toEntity(category.getParent()) : null);
        return entity;
    }

    public static Category toDomain(CategoryEntity entity) {
        if (entity == null) return null;
        return new Category(
            entity.getId(),
            entity.getName(),
            entity.getIcon(),
            entity.getType(),
            toDomain(entity.getParent())
        );
    }
}

@Repository
class CategoryRepositoryImpl implements CategoryRepository {
    private final CategoryJpaRepository jpaRepository;

    public CategoryRepositoryImpl(CategoryJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Category save(Category category) {
        CategoryEntity entity = CategoryEntityMapper.toEntity(category);
        CategoryEntity saved = jpaRepository.save(entity);
        return CategoryEntityMapper.toDomain(saved);
    }

    @Override
    public Category findById(Long id) {
        return jpaRepository.findById(id)
                .map(CategoryEntityMapper::toDomain)
                .orElse(null);
    }
}

@Entity
@Table(name = "categories")
class CategoryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String icon;
    @Enumerated(EnumType.STRING)
    private CategoryType type;
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private CategoryEntity parent;

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

    public CategoryEntity getParent() {
        return parent;
    }

    public void setParent(CategoryEntity parent) {
        this.parent = parent;
    }
}