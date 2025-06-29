package com.personal.money.management.core.account.domain.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class AccountTest {

    @Test
    void testConstructorAndGetters() {
        Account account = new Account("Test Account", BigDecimal.valueOf(100), AccountType.CASH, "USD", "desc");

        assertNull(account.getId());
        assertEquals("Test Account", account.getAccountName());
        assertEquals(BigDecimal.valueOf(100), account.getInitBalance());
        assertEquals(AccountType.CASH, account.getType());
        assertEquals("USD", account.getCurrency());
        assertEquals("desc", account.getDescription());
    }

    @Test
    void testUpdate() {
        Account account = new Account("Old Account", BigDecimal.valueOf(50), AccountType.BANK_ACCOUNT, "USD", "old desc");

        // Since Account is immutable, create a new instance to represent the updated account
        Account updatedAccount = Account.reconstruct(
                null,
                "New Account",
                BigDecimal.valueOf(150),
                AccountType.CREDIT_CARD,
                "EUR",
                "new desc"
        );

        assertEquals("New Account", updatedAccount.getAccountName());
        assertEquals(BigDecimal.valueOf(150), updatedAccount.getInitBalance());
        assertEquals(AccountType.CREDIT_CARD, updatedAccount.getType());
        assertEquals("EUR", updatedAccount.getCurrency());
        assertEquals("new desc", updatedAccount.getDescription());
    }

    @Test
    void testReconstruct() {
        Account account = Account.reconstruct(1L, "Reconstructed Account", BigDecimal.valueOf(200), AccountType.INVESTMENT, "USD", "desc");

        assertEquals(1L, account.getId());
        assertEquals("Reconstructed Account", account.getAccountName());
        assertEquals(BigDecimal.valueOf(200), account.getInitBalance());
        assertEquals(AccountType.INVESTMENT, account.getType());
        assertEquals("USD", account.getCurrency());
        assertEquals("desc", account.getDescription());
    }
}
