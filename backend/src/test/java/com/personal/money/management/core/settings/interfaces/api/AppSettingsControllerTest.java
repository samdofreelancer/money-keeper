package com.personal.money.management.core.settings.interfaces.api;

import com.personal.money.management.core.settings.application.AppSettingsService;
import com.personal.money.management.core.settings.infrastructure.persistence.AppSettingsEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for AppSettingsController.
 * Focuses on HTTP request handling with mocked service layer.
 * Integration tested separately.
 */
@WebMvcTest(AppSettingsController.class)
class AppSettingsControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppSettingsService service;

    @Test
    void get_shouldReturnSettings() throws Exception {
        AppSettingsEntity settings = new AppSettingsEntity();
        settings.setId(1L);
        settings.setDefaultCurrency("USD");

        when(service.get()).thenReturn(settings);

        mockMvc.perform(get("/api/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.defaultCurrency").value("USD"));
    }

    @Test
    void updateCurrency_shouldUpdateAndReturnSettings() throws Exception {
        AppSettingsEntity updatedSettings = new AppSettingsEntity();
        updatedSettings.setId(1L);
        updatedSettings.setDefaultCurrency("EUR");

        when(service.updateDefaultCurrency("EUR")).thenReturn(updatedSettings);

        String requestBody = "{\"defaultCurrency\":\"EUR\"}";

        mockMvc.perform(put("/api/settings/currency")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
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
    void updateCurrency_shouldReturnBadRequest_whenRequestBodyIsInvalid() throws Exception {
        String requestBody = "{\"invalidField\":\"value\"}";

        mockMvc.perform(put("/api/settings/currency")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void reset_shouldResetToDefaultCurrency() throws Exception {
        AppSettingsEntity resetSettings = new AppSettingsEntity();
        resetSettings.setId(1L);
        resetSettings.setDefaultCurrency("USD");

        when(service.reset()).thenReturn(resetSettings);

        mockMvc.perform(post("/api/settings/reset"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.defaultCurrency").value("USD"));
    }

    @Test
    void updateCurrency_shouldReturnBadRequest_whenCurrencyExceedsMaxLength() throws Exception {
        String requestBody = "{\"defaultCurrency\":\"TOOLONGCCYCODE\"}";

        mockMvc.perform(put("/api/settings/currency")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest());
    }
}
