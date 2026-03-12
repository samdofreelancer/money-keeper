package com.personal.money.management.service.settings.domain.model;

public class AppSettings {
    private Long id;
    private String defaultCurrency;

    public AppSettings() {}

    public AppSettings(Long id, String defaultCurrency) {
        this.id = id;
        this.defaultCurrency = defaultCurrency;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDefaultCurrency() { return defaultCurrency; }
    public void setDefaultCurrency(String defaultCurrency) { this.defaultCurrency = defaultCurrency; }
} 