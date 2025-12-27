package com.personal.money.management.core.account.domain.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CurrencyModelTest {

    @Test
    void currency_allArgs_and_getters() {
        Currency c = new Currency(1L, "USD", "US Dollar", "$", "flag.png");

        assertThat(c.getId()).isEqualTo(1L);
        assertThat(c.getCode()).isEqualTo("USD");
        assertThat(c.getName()).isEqualTo("US Dollar");
        assertThat(c.getSymbol()).isEqualTo("$");
        assertThat(c.getFlag()).isEqualTo("flag.png");
    }
}
