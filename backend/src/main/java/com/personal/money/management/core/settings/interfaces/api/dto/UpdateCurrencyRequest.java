package com.personal.money.management.core.settings.interfaces.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateCurrencyRequest {
    @NotBlank(message = "Default currency is required")
    @Size(max = 10, message = "Currency code must not exceed 10 characters")
    private String defaultCurrency;

    public String getDefaultCurrency() {
        return defaultCurrency;
    }

    public void setDefaultCurrency(String defaultCurrency) {
        this.defaultCurrency = defaultCurrency;
    }
}
