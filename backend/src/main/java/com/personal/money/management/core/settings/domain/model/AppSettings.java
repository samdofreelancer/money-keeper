package com.personal.money.management.core.settings.domain.model;

import com.personal.money.management.core.shared.domain.AggregateRoot;

/**
 * Aggregate Root representing application-wide settings.
 *
 * <p>Responsibilities:</p>
 * <ul>
 *   <li>Maintains application configuration state</li>
 *   <li>Manages default currency and other global settings</li>
 *   <li>Provides single source of truth for app configuration</li>
 * </ul>
 *
 * <p>Note: This is typically a singleton aggregate with usually one instance.</p>
 */
@AggregateRoot(
    boundedContext = "settings",
    description = "Manages application-wide settings and configuration. Provides global defaults for currency and other settings."
)
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