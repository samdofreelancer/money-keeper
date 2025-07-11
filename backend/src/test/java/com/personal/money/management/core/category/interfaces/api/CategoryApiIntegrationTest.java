package com.personal.money.management.core.category.interfaces.api;

import com.personal.money.management.core.category.domain.model.CategoryType;
import com.personal.money.management.core.category.domain.repository.CategoryRepository;
import com.personal.money.management.core.category.interfaces.api.dto.CategoryRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import com.personal.money.management.core.PersonalMoneyManagementApplication;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * Integration tests for Category API.
 * Tests full stack including HTTP, service, and persistence layers.
 * Focuses on end-to-end behavior and validation.
 */
@SpringBootTest(classes = PersonalMoneyManagementApplication.class)
@AutoConfigureMockMvc
@Transactional
class CategoryApiIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    @BeforeEach
    void cleanDatabase() {
        categoryRepository.findAllSortedByName().forEach(category -> {
            categoryRepository.deleteById(category.getId());
        });
    }

    @Test
    void createCategory_shouldPersistAndReturnCategory() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setName("Groceries");
        request.setIcon("shopping_cart");
        request.setType(CategoryType.EXPENSE);
        request.setParentId(null);

        ResultActions result = mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        result.andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name").value("Groceries"))
                .andExpect(jsonPath("$.icon").value("shopping_cart"))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.parentId").doesNotExist());
    }

    @Test
    void createCategory_withParent_shouldPersistParentRelationship() throws Exception {
        // Create parent category first
        CategoryRequest parentRequest = new CategoryRequest();
        parentRequest.setName("Parent");
        parentRequest.setIcon("parent_icon");
        parentRequest.setType(CategoryType.EXPENSE);
        parentRequest.setParentId(null);

        String parentResponse = mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(parentRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long parentId = objectMapper.readTree(parentResponse).get("id").asLong();

        // Create child category with parentId
        CategoryRequest childRequest = new CategoryRequest();
        childRequest.setName("Child");
        childRequest.setIcon("child_icon");
        childRequest.setType(CategoryType.EXPENSE);
        childRequest.setParentId(parentId);

        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(childRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.parentId").value(parentId));
    }

    @Test
    void createCategory_withoutParent_shouldPersistWithoutParent() throws Exception {
        CategoryRequest noParentRequest = new CategoryRequest();
        noParentRequest.setName("No Parent");
        noParentRequest.setIcon("no_icon");
        noParentRequest.setType(CategoryType.EXPENSE);
        noParentRequest.setParentId(null);

        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(noParentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.parentId").doesNotExist());
    }

    @Test
    void createCategory_shouldReturn400ForInvalidRequest() throws Exception {
        // Missing name and type
        String invalidRequest = "{" +
                "\"icon\":\"icon\"" +
                "}";
        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createCategory_shouldReturn404ForInvalidParent() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setName("Invalid Parent");
        request.setIcon("icon");
        request.setType(CategoryType.EXPENSE);
        request.setParentId(99999L); // Non-existent parentId

        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllSortedByName_shouldReturnSortedCategories() throws Exception {
        // Create categories
        CategoryRequest request1 = new CategoryRequest();
        request1.setName("B");
        request1.setIcon("iconB");
        request1.setType(CategoryType.EXPENSE);
        request1.setParentId(null);

        CategoryRequest request2 = new CategoryRequest();
        request2.setName("A");
        request2.setIcon("iconA");
        request2.setType(CategoryType.EXPENSE);
        request2.setParentId(null);

        CategoryRequest request3 = new CategoryRequest();
        request3.setName("C");
        request3.setIcon("iconC");
        request3.setType(CategoryType.EXPENSE);
        request3.setParentId(null);

        // Create categories via API
        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request3)))
                .andExpect(status().isCreated());

        // Test GET /api/categories returns sorted list by name
        mockMvc.perform(MockMvcRequestBuilders.get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].name").value("A"))
                .andExpect(jsonPath("$[1].name").value("B"))
                .andExpect(jsonPath("$[2].name").value("C"));
    }

    @Test
    void updateCategory_shouldPersistAndReturnUpdatedCategory() throws Exception {
        // Create a category first
        CategoryRequest createRequest = new CategoryRequest();
        createRequest.setName("Initial Name");
        createRequest.setIcon("initial_icon");
        createRequest.setType(CategoryType.EXPENSE);
        createRequest.setParentId(null);

        String createResponse = mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long categoryId = objectMapper.readTree(createResponse).get("id").asLong();

        // Update the category
        CategoryRequest updateRequest = new CategoryRequest();
        updateRequest.setName("Updated Name");
        updateRequest.setIcon("updated_icon");
        updateRequest.setType(CategoryType.INCOME);
        updateRequest.setParentId(null);

        mockMvc.perform(MockMvcRequestBuilders.put("/api/categories/{id}", categoryId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(categoryId))
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.icon").value("updated_icon"))
                .andExpect(jsonPath("$.type").value("INCOME"))
                .andExpect(jsonPath("$.parentId").doesNotExist());
    }

    @Test
    void updateCategory_shouldReturn404IfCategoryNotFound() throws Exception {
        Long nonExistentCategoryId = 9999L;

        CategoryRequest updateRequest = new CategoryRequest();
        updateRequest.setName("Non Existent");
        updateRequest.setIcon("no_icon");
        updateRequest.setType(CategoryType.EXPENSE);
        updateRequest.setParentId(null);

        mockMvc.perform(MockMvcRequestBuilders.put("/api/categories/{id}", nonExistentCategoryId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    void createCategory_shouldReturn400ForBlankName() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setName("");
        request.setIcon("icon");
        request.setType(CategoryType.EXPENSE);
        request.setParentId(null);

        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createCategory_shouldReturn400ForNameExceedingMaxLength() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setName("a".repeat(101)); // 101 chars
        request.setIcon("icon");
        request.setType(CategoryType.EXPENSE);
        request.setParentId(null);

        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createCategory_shouldReturn400ForIconExceedingMaxLength() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setName("Valid Name");
        request.setIcon("i".repeat(51)); // 51 chars
        request.setType(CategoryType.EXPENSE);
        request.setParentId(null);

        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteCategory_shouldReturnNoContent() throws Exception {
        // Create a category first
        CategoryRequest createRequest = new CategoryRequest();
        createRequest.setName("Delete Test");
        createRequest.setIcon("delete_icon");
        createRequest.setType(CategoryType.EXPENSE);
        createRequest.setParentId(null);

        String createResponse = mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long categoryId = objectMapper.readTree(createResponse).get("id").asLong();

        // Delete the category
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/categories/{id}", categoryId))
                .andExpect(status().isNoContent());

        // Verify deletion by attempting to delete again (should return 404)
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/categories/{id}", categoryId))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteCategory_shouldReturnNotFoundForNonExistentId() throws Exception {
        Long nonExistentId = 999999L;
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/categories/{id}", nonExistentId))
                .andExpect(status().isNotFound());
    }

}
