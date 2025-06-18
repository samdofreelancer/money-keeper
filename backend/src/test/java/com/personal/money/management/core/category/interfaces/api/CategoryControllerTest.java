package com.personal.money.management.core.category.interfaces.api;

import com.personal.money.management.core.category.application.CategoryService;
import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;

/**
 * Unit tests for CategoryController.
 * Focuses on HTTP request handling with mocked service layer.
 * Integration tested separately.
 */
@WebMvcTest(CategoryController.class)
class CategoryControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryService categoryService;

    @Test
    void createCategory_shouldReturnCategoryResponse() throws Exception {
        Category category = new Category(1L, "Groceries", "shopping_cart", CategoryType.EXPENSE, null);
        when(categoryService.createCategory(any(), any(), any(), any())).thenReturn(category);

        String requestBody = "{" +
                "\"name\":\"Groceries\"," +
                "\"icon\":\"shopping_cart\"," +
                "\"type\":\"EXPENSE\"," +
                "\"parentId\":null" +
                "}";

        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Groceries"))
                .andExpect(jsonPath("$.icon").value("shopping_cart"))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.parentId").doesNotExist());
    }

    @Test
    void updateCategory_shouldReturnUpdatedCategoryResponse() throws Exception {
        Long categoryId = 1L;
        Category updatedCategory = new Category(categoryId, "Updated Name", "updated_icon", CategoryType.INCOME, null);
        when(categoryService.updateCategory(categoryId, "Updated Name", "updated_icon", CategoryType.INCOME, null))
                .thenReturn(updatedCategory);

        String requestBody = "{" +
                "\"name\":\"Updated Name\"," +
                "\"icon\":\"updated_icon\"," +
                "\"type\":\"INCOME\"," +
                "\"parentId\":null" +
                "}";

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/categories/{id}", categoryId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(categoryId))
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.icon").value("updated_icon"))
                .andExpect(jsonPath("$.type").value("INCOME"))
                .andExpect(jsonPath("$.parentId").doesNotExist());
    }

    @Test
    void deleteCategory_shouldReturnNoContent() throws Exception {
        Long categoryId = 1L;

        doNothing().when(categoryService).deleteCategory(categoryId);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/categories/{id}", categoryId))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteCategory_shouldReturnNotFound() throws Exception {
        Long categoryId = 1L;

        doThrow(new com.personal.money.management.core.category.application.exception.CategoryNotFoundException(categoryId))
                .when(categoryService).deleteCategory(categoryId);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/categories/{id}", categoryId))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteCategory_shouldReturnConflictIfCategoryHasChildren() throws Exception {
        Long categoryId = 1L;

        doThrow(new com.personal.money.management.core.category.application.exception.CategoryHasChildException(categoryId))
                .when(categoryService).deleteCategory(categoryId);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/categories/{id}", categoryId))
                .andExpect(status().isConflict());
    }

    @Test
    void updateCategory_shouldReturnConflictIfCyclicDependency() throws Exception {
        Long categoryId = 1L;

        doThrow(new com.personal.money.management.core.category.application.exception.CategoryCyclicDependencyException("Cyclic dependency detected"))
                .when(categoryService).updateCategory(anyLong(), anyString(), anyString(), any(), any());

        String requestBody = "{" +
                "\"name\":\"Updated Name\"," +
                "\"icon\":\"updated_icon\"," +
                "\"type\":\"INCOME\"," +
                "\"parentId\":null" +
                "}";

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/categories/{id}", categoryId)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isConflict());
    }

    @Test
    void updateCategory_shouldReturnConflictIfCategoryConflictException() throws Exception {
        Long categoryId = 1L;

        doThrow(new com.personal.money.management.core.category.application.exception.CategoryConflictException("Concurrent modification"))
                .when(categoryService).updateCategory(anyLong(), anyString(), anyString(), any(), any());

        String requestBody = "{" +
                "\"name\":\"Updated Name\"," +
                "\"icon\":\"updated_icon\"," +
                "\"type\":\"INCOME\"," +
                "\"parentId\":null" +
                "}";

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/categories/{id}", categoryId)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isConflict());
    }

    @Test
    void deleteCategory_shouldReturnConflictIfCategoryConflictException() throws Exception {
        Long categoryId = 1L;

        doThrow(new com.personal.money.management.core.category.application.exception.CategoryConflictException("Concurrent modification"))
                .when(categoryService).deleteCategory(anyLong());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/categories/{id}", categoryId))
                .andExpect(status().isConflict());
    }
}
