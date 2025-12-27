package com.personal.money.management.core.category.interfaces.api.dto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ApiErrorResponseTest {

    @Test
    void constructors_and_getters_setters() {
        ApiErrorResponse a = new ApiErrorResponse();
        assertThat(a.getTimestamp()).isNotNull();

        ApiErrorResponse b = new ApiErrorResponse(400, "BadRequest", "missing field");
        assertThat(b.getStatus()).isEqualTo(400);
        assertThat(b.getError()).isEqualTo("BadRequest");
        assertThat(b.getMessage()).isEqualTo("missing field");

        b.setStatus(401);
        b.setError("Auth");
        b.setMessage("no auth");
        assertThat(b.getStatus()).isEqualTo(401);
        assertThat(b.getError()).isEqualTo("Auth");
        assertThat(b.getMessage()).isEqualTo("no auth");
    }
}
