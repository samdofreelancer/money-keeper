package com.personal.money.management.core.category.interfaces.api.dto;

import com.personal.money.management.core.category.domain.model.CategoryType;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CategoryDtoTest {

    @Test
    void categoryRequest_and_response_getters_setters() {
        CategoryRequest req = new CategoryRequest();
        req.setName("Food");
        req.setIcon("icon");
        req.setType(CategoryType.EXPENSE);
        req.setParentId(11L);

        assertThat(req.getName()).isEqualTo("Food");
        assertThat(req.getIcon()).isEqualTo("icon");
        assertThat(req.getType()).isEqualTo(CategoryType.EXPENSE);
        assertThat(req.getParentId()).isEqualTo(11L);

    CategoryResponse resp = new CategoryResponse();
    resp.setId(22L);
    resp.setName("Food");
    resp.setIcon("icon");
    resp.setType(CategoryType.EXPENSE);
    resp.setParentId(11L);

    assertThat(resp.getId()).isEqualTo(22L);
    assertThat(resp.getName()).isEqualTo("Food");
    }
}
