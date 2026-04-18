package com.personal.money.management.core.account.domain.model;

import com.personal.money.management.core.shared.domain.valueobject.AccountName;
import com.personal.money.management.core.shared.domain.valueobject.Money;
import com.personal.money.management.core.shared.domain.valueobject.CurrencyCode;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class AccountTest {

    @Test
    void testConstructorAndGetters() {
        AccountName name = AccountName.of("Test Account");
        Money balance = Money.of(BigDecimal.valueOf(100), CurrencyCode.of("USD"));
        
        Account account = new Account(name, balance, AccountType.CASH, "desc");

        assertNull(account.getId());
        assertEquals("Test Account", account.getName().getValue());
        assertEquals(0, account.getInitialBalance().getAmount().compareTo(BigDecimal.valueOf(100)));
        assertEquals(AccountType.CASH, account.getType());
        assertEquals("USD", account.getInitialBalance().getCurrency().getCode());
        assertEquals("desc", account.getDescription());
    }

    @Test
    void testUpdate() {
        AccountName oldName = AccountName.of("Old Account");
        Money oldBalance = Money.of(BigDecimal.valueOf(50), CurrencyCode.of("USD"));
        Account account = new Account(oldName, oldBalance, AccountType.BANK_ACCOUNT, "old desc");

        // Since Account is immutable, create a new instance to represent the updated account
        AccountName newName = AccountName.of("New Account");
        Money newBalance = Money.of(BigDecimal.valueOf(150), CurrencyCode.of("EUR"));
        Account updatedAccount = Account.reconstruct(
                null,
                newName,
                newBalance,
                AccountType.CREDIT_CARD,
                "new desc",
                true
        );

        assertEquals("New Account", updatedAccount.getName().getValue());
        assertEquals(0, updatedAccount.getInitialBalance().getAmount().compareTo(BigDecimal.valueOf(150)));
        assertEquals(AccountType.CREDIT_CARD, updatedAccount.getType());
        assertEquals("EUR", updatedAccount.getInitialBalance().getCurrency().getCode());
        assertEquals("new desc", updatedAccount.getDescription());
    }

    @Test
    void testReconstruct() {
        AccountName name = AccountName.of("Reconstructed Account");
        Money balance = Money.of(BigDecimal.valueOf(200), CurrencyCode.of("USD"));
        
        Account account = Account.reconstruct(1L, name, balance, AccountType.INVESTMENT, "desc", true);

        assertEquals(1L, account.getId());
        assertEquals("Reconstructed Account", account.getName().getValue());
        assertEquals(0, account.getInitialBalance().getAmount().compareTo(BigDecimal.valueOf(200)));
        assertEquals(AccountType.INVESTMENT, account.getType());
        assertEquals("USD", account.getInitialBalance().getCurrency().getCode());
        assertEquals("desc", account.getDescription());
    }
}
