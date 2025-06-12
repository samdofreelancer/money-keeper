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
}
