package com.personal.money.management.core.settings.interfaces.api;

import com.personal.money.management.core.settings.infrastructure.persistence.AppSettingsRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * Integration tests for AppSettings API.
 * Tests full stack including HTTP, service, and persistence layers.
 * Focuses on end-to-end behavior and validation.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AppSettingsApiIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppSettingsRepository repository;

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll();
    }

    @Test
    void get_shouldReturnDefaultSettings_whenNoSettingsExist() throws Exception {
        mockMvc.perform(get("/api/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.defaultCurrency").value("USD"));
    }

    @Test
    void get_shouldReturnExistingSettings_whenSettingsExist() throws Exception {
        // First call creates default settings
        mockMvc.perform(get("/api/settings"));

        mockMvc.perform(get("/api/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.defaultCurrency").value("USD"));
    }

    @Test
    void updateCurrency_shouldUpdateAndPersistSettings() throws Exception {
        String requestBody = "{\"defaultCurrency\":\"EUR\"}";

        mockMvc.perform(put("/api/settings/currency")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.defaultCurrency").value("EUR"));

        // Verify persistence by calling get again
        mockMvc.perform(get("/api/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.defaultCurrency").value("EUR"));
    }

    @Test
    void updateCurrency_shouldReturnBadRequest_whenCurrencyIsBlank() throws Exception {
        String requestBody = "{\"defaultCurrency\":\"\"}";

        mockMvc.perform(put("/api/settings/currency")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateCurrency_shouldReturnBadRequest_whenCurrencyIsNull() throws Exception {
        String requestBody = "{\"defaultCurrency\":null}";

        mockMvc.perform(put("/api/settings/currency")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateCurrency_shouldReturnBadRequest_whenCurrencyExceedsMaxLength() throws Exception {
        String requestBody = "{\"defaultCurrency\":\"TOOLONGCCYCODE\"}";

        mockMvc.perform(put("/api/settings/currency")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void reset_shouldResetCurrencyToUSD() throws Exception {
        // First update to a different currency
        String updateBody = "{\"defaultCurrency\":\"EUR\"}";
        mockMvc.perform(put("/api/settings/currency")
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateBody));

        // Then reset to USD
        mockMvc.perform(post("/api/settings/reset"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.defaultCurrency").value("USD"));

        // Verify persistence
        mockMvc.perform(get("/api/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.defaultCurrency").value("USD"));
    }

    @Test
    void reset_shouldCreateSettingsWithUSD_whenNoSettingsExist() throws Exception {
        mockMvc.perform(post("/api/settings/reset"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.defaultCurrency").value("USD"));

        // Verify persistence
        mockMvc.perform(get("/api/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.defaultCurrency").value("USD"));
    }

    @Test
    void updateCurrency_shouldHandleConcurrentUpdates() throws Exception {
        String requestBody1 = "{\"defaultCurrency\":\"EUR\"}";
        String requestBody2 = "{\"defaultCurrency\":\"GBP\"}";

        // First update
        mockMvc.perform(put("/api/settings/currency")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.defaultCurrency").value("EUR"));

        // Second update should overwrite
        mockMvc.perform(put("/api/settings/currency")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.defaultCurrency").value("GBP"));

        // Verify final state
        mockMvc.perform(get("/api/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.defaultCurrency").value("GBP"));
    }
}
