package com.personal.money.management.core.category.integration;

import com.personal.money.management.core.category.interfaces.api.CategoryController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.personal.money.management.core.category.application.CategoryService;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.personal.money.management.core.category.domain.model.Icon;

@WebMvcTest(CategoryController.class)
public class CategoryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryService categoryService;

    @Test
    public void testGetAvailableIcons() throws Exception {
        Icon icon1 = new Icon("Icon1", "icon1-value");
        Icon icon2 = new Icon("Icon2", "icon2-value");

        when(categoryService.getAllIcons()).thenReturn(List.of(icon1, icon2));

        mockMvc.perform(get("/api/categories/icons"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].label").value("Icon1"))
                .andExpect(jsonPath("$[0].iconValue").value("icon1-value"))
                .andExpect(jsonPath("$[1].label").value("Icon2"))
                .andExpect(jsonPath("$[1].iconValue").value("icon2-value"));
    }
}
