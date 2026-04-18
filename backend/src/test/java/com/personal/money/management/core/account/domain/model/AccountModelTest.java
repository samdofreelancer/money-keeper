package com.personal.money.management.core.account.domain.model;

import com.personal.money.management.core.shared.domain.valueobject.AccountName;
import com.personal.money.management.core.shared.domain.valueobject.Money;
import com.personal.money.management.core.shared.domain.valueobject.CurrencyCode;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class AccountModelTest {

    @Test
    void createAccount_and_reconstruct() {
        AccountName name = AccountName.of("MyAcct");
        Money balance = Money.of(new BigDecimal("100.00"), CurrencyCode.of("USD"));
        Account acc = new Account(name, balance, AccountType.CASH, "desc");

        assertThat(acc.getId()).isNull();
        assertThat(acc.getName().getValue()).isEqualTo("MyAcct");
        assertThat(acc.getInitialBalance().getAmount()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(acc.getType()).isEqualTo(AccountType.CASH);
        assertThat(acc.getInitialBalance().getCurrency().getCode()).isEqualTo("USD");
        assertThat(acc.getDescription()).isEqualTo("desc");
        assertThat(acc.isActive()).isTrue();

        // reconstruct with explicit fields
        AccountName reName = AccountName.of("ReAcct");
        Money reMoney = Money.of(new BigDecimal("0.00"), CurrencyCode.of("EUR"));
        Account reconstructed = Account.reconstruct(10L, reName, reMoney, AccountType.BANK_ACCOUNT, "rdesc", false);
        assertThat(reconstructed.getId()).isEqualTo(10L);
        assertThat(reconstructed.getName().getValue()).isEqualTo("ReAcct");
        assertThat(reconstructed.isActive()).isFalse();
    }
}
