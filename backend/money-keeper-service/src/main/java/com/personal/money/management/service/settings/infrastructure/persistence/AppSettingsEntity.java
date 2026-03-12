package com.personal.money.management.service.settings.infrastructure.persistence;

import javax.persistence.*;

@Entity
@Table(name = "app_settings")
public class AppSettingsEntity {

    @Id
    private Long id;

    @Column(name = "default_currency", nullable = false, length = 10)
    private String defaultCurrency;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDefaultCurrency() { return defaultCurrency; }
    public void setDefaultCurrency(String defaultCurrency) { this.defaultCurrency = defaultCurrency; }
} 