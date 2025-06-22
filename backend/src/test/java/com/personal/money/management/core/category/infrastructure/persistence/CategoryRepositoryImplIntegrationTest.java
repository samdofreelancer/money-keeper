package com.personal.money.management.core.category.infrastructure.persistence;

import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;
import com.personal.money.management.core.category.domain.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.personal.money.management.core.PersonalMoneyManagementApplication;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = PersonalMoneyManagementApplication.class)
@Transactional
class CategoryRepositoryImplIntegrationTest {
    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void saveAndFindById_shouldPersistAndRetrieveCategory() {
        Category category = new Category("Test", "test_icon", CategoryType.EXPENSE, null);
        Category saved = categoryRepository.save(category);
        assertNotNull(saved.getId());

        Category found = categoryRepository.findById(saved.getId()).orElseThrow();
        assertNotNull(found);
        assertEquals("Test", found.getName());
        assertEquals("test_icon", found.getIcon());
        assertEquals(CategoryType.EXPENSE, found.getType());
        assertNull(found.getParent());
    }

    @Test
    void saveWithParent_shouldPersistParentRelationship() {
        Category parent = new Category("Parent", "parent_icon", CategoryType.EXPENSE, null);
        Category savedParent = categoryRepository.save(parent);

        Category child = new Category("Child", "child_icon", CategoryType.EXPENSE, savedParent);
        Category savedChild = categoryRepository.save(child);

        Category foundChild = categoryRepository.findById(savedChild.getId()).orElseThrow();
        assertNotNull(foundChild.getParent());
        assertEquals(savedParent.getId(), foundChild.getParent().getId());
    }
}
