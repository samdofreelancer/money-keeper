package com.personal.money.management.core.settings.domain.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AppSettingsTest {

    @Test
    void defaultConstructor_and_setters_getters() {
        AppSettings s = new AppSettings();
        s.setId(5L);
        s.setDefaultCurrency("VND");

        assertThat(s.getId()).isEqualTo(5L);
        assertThat(s.getDefaultCurrency()).isEqualTo("VND");
    }

    @Test
    void allArgsConstructor() {
        AppSettings s = new AppSettings(7L, "USD");
        assertThat(s.getId()).isEqualTo(7L);
        assertThat(s.getDefaultCurrency()).isEqualTo("USD");
    }
}
