package com.personal.money.management.core.account.domain.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class AccountModelTest {

    @Test
    void createAccount_and_reconstruct() {
        Account acc = new Account("MyAcct", new BigDecimal("100.00"), AccountType.CASH, "USD", "desc");

        assertThat(acc.getId()).isNull();
        assertThat(acc.getAccountName()).isEqualTo("MyAcct");
        assertThat(acc.getInitBalance()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(acc.getType()).isEqualTo(AccountType.CASH);
        assertThat(acc.getCurrency()).isEqualTo("USD");
        assertThat(acc.getDescription()).isEqualTo("desc");
        assertThat(acc.isActive()).isTrue();

        // reconstruct with explicit fields
        Account reconstructed = Account.reconstruct(10L, "ReAcct", new BigDecimal("0.00"), AccountType.BANK_ACCOUNT, "EUR", "rdesc", false);
        assertThat(reconstructed.getId()).isEqualTo(10L);
        assertThat(reconstructed.getAccountName()).isEqualTo("ReAcct");
        assertThat(reconstructed.isActive()).isFalse();
    }
}
