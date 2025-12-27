package com.personal.money.management.core.category.infrastructure.persistence;

import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CategoryRepositoryImplTest {

    @Mock
    private CategoryJpaRepository jpa;

    private CategoryRepositoryImpl repo;

    @BeforeEach
    void init() {
        MockitoAnnotations.openMocks(this);
        repo = new CategoryRepositoryImpl(jpa);
    }

    @Test
    void save_null_returns_null() {
        assertThat(repo.save(null)).isNull();
        verifyNoInteractions(jpa);
    }

    @Test
    void save_new_and_existing_paths() {
        Category newCat = new Category("N", "i", CategoryType.EXPENSE, null);
        CategoryEntity savedEntity = new CategoryEntity(11L, "N", "i", CategoryType.EXPENSE, null, 1L);
        when(jpa.save(any())).thenReturn(savedEntity);

        Category result = repo.save(newCat);
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("N");

        // existing path: category with id
        Category existingDomain = Category.reconstruct(20L, "E", "ei", CategoryType.INCOME, null);
        CategoryEntity existingEntity = new CategoryEntity(20L, "Old", "oi", CategoryType.INCOME, null, 5L);
        when(jpa.findById(20L)).thenReturn(Optional.of(existingEntity));
        when(jpa.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Category out = repo.save(existingDomain);
        assertThat(out).isNotNull();
        verify(jpa).findById(20L);
    }

    @Test
    void findById_and_findAllSortedByName_and_delete() {
        CategoryEntity e1 = new CategoryEntity(1L, "A", "a", CategoryType.EXPENSE, null, 1L);
        when(jpa.findById(1L)).thenReturn(Optional.of(e1));
        Optional<Category> opt = repo.findById(1L);
        assertThat(opt).isPresent();
        assertThat(opt.get().getName()).isEqualTo("A");

        when(jpa.findAll(Sort.by("name"))).thenReturn(List.of(e1));
        var all = repo.findAllSortedByName();
        assertThat(all).hasSize(1);

        repo.deleteById(1L);
        verify(jpa).deleteById(1L);
    }

    @Test
    void findByParent_and_findByName() {
        Category parent = Category.reconstruct(8L, "P", "pi", CategoryType.EXPENSE, null);
        CategoryEntity child = new CategoryEntity(9L, "C", "ci", CategoryType.INCOME, null, 1L);

        when(jpa.findById(8L)).thenReturn(Optional.of(new CategoryEntity(8L, "P", "pi", CategoryType.EXPENSE, null, 1L)));
        when(jpa.findByParent(any())).thenReturn(List.of(child));

        var children = repo.findByParent(parent);
        assertThat(children).hasSize(1);

        when(jpa.findByName("X")).thenReturn(null);
        assertThat(repo.findByName("X")).isEmpty();

        when(jpa.findByName("C")).thenReturn(child);
        assertThat(repo.findByName("C")).isPresent();
    }
}
