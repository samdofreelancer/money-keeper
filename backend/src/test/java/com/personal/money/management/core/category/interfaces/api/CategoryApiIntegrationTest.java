package com.personal.money.management.core.category.interfaces.api;

import com.personal.money.management.core.category.domain.model.CategoryType;
import com.personal.money.management.core.category.interfaces.api.dto.CategoryRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * Integration tests for Category API.
 * Tests full stack including HTTP, service, and persistence layers.
 * Focuses on end-to-end behavior and validation.
 */
@SpringBootTest
@AutoConfigureMockMvc
class CategoryApiIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

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

        result.andExpect(status().isOk())
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
                .andExpect(status().isOk())
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
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.parentId").value(parentId));
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
}
