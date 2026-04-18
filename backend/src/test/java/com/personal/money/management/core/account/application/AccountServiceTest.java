package com.personal.money.management.core.account.application;

import com.personal.money.management.core.account.application.exception.AccountNotFoundException;
import com.personal.money.management.core.account.domain.model.Account;
import com.personal.money.management.core.account.domain.model.AccountType;
import com.personal.money.management.core.account.domain.repository.AccountRepository;
import com.personal.money.management.core.shared.domain.valueobject.AccountName;
import com.personal.money.management.core.shared.domain.valueobject.Money;
import com.personal.money.management.core.shared.domain.valueobject.CurrencyCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AccountServiceTest {

    private AccountRepository accountRepository;
    private AccountService accountService;

    @BeforeEach
    void setUp() {
        accountRepository = mock(AccountRepository.class);
        accountService = new AccountService(accountRepository);
    }

    @Test
    void testCreateAccount() {
        AccountName name = AccountName.of("Test Account");
        Money balance = Money.of(BigDecimal.valueOf(100), CurrencyCode.of("USD"));
        Account account = new Account(name, balance, AccountType.CASH, "desc");
        when(accountRepository.save(account)).thenReturn(account);

        Account created = accountService.createAccount(account);

        assertEquals(account, created);
        verify(accountRepository).save(account);
    }

    @Test
    void testUpdateAccount_Success() {
        Long id = 1L;
        AccountName oldName = AccountName.of("Old Account");
        Money oldBalance = Money.of(BigDecimal.valueOf(50), CurrencyCode.of("USD"));
        Account existing = new Account(oldName, oldBalance, AccountType.BANK_ACCOUNT, "old desc");
        
        AccountName newName = AccountName.of("New Account");
        Money newBalance = Money.of(BigDecimal.valueOf(150), CurrencyCode.of("USD"));
        Account updated = new Account(newName, newBalance, AccountType.CREDIT_CARD, "new desc");

        when(accountRepository.findById(id)).thenReturn(Optional.of(existing));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Account result = accountService.updateAccount(id, updated);

        assertEquals("New Account", result.getName().getValue());
        assertEquals(0, result.getInitialBalance().getAmount().compareTo(BigDecimal.valueOf(150)));
        assertEquals(AccountType.CREDIT_CARD, result.getType());
        assertEquals("new desc", result.getDescription());
        verify(accountRepository).findById(id);
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void testUpdateAccount_NotFound() {
        Long id = 1L;
        AccountName name = AccountName.of("New Account");
        Money balance = Money.of(BigDecimal.valueOf(150), CurrencyCode.of("USD"));
        Account updated = new Account(name, balance, AccountType.CREDIT_CARD, "new desc");

        when(accountRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(AccountNotFoundException.class, () -> accountService.updateAccount(id, updated));
        verify(accountRepository).findById(id);
        verify(accountRepository, never()).save(any());
    }

    @Test
    void testDeleteAccount() {
        Long id = 1L;
        doNothing().when(accountRepository).deleteById(id);

        accountService.deleteAccount(id);

        verify(accountRepository).deleteById(id);
    }

    @Test
    void testListAccounts() {
        AccountName name1 = AccountName.of("A1");
        Money balance1 = Money.of(BigDecimal.valueOf(100), CurrencyCode.of("USD"));
        Account a1 = new Account(name1, balance1, AccountType.CASH, "desc1");
        
        AccountName name2 = AccountName.of("A2");
        Money balance2 = Money.of(BigDecimal.valueOf(200), CurrencyCode.of("USD"));
        Account a2 = new Account(name2, balance2, AccountType.BANK_ACCOUNT, "desc2");
        
        when(accountRepository.findAll()).thenReturn(Arrays.asList(a1, a2));

        List<Account> accounts = accountService.listAccounts();

        assertEquals(2, accounts.size());
        verify(accountRepository).findAll();
    }

    @Test
    void testGetTotalBalanceOfActiveAccounts() {
        AccountName name1 = AccountName.of("A1");
        Money balance1 = Money.of(BigDecimal.valueOf(100), CurrencyCode.of("USD"));
        Account a1 = new Account(name1, balance1, AccountType.CASH, "desc1");
        
        AccountName name2 = AccountName.of("A2");
        Money balance2 = Money.of(BigDecimal.ZERO, CurrencyCode.of("USD"));
        Account a2 = new Account(name2, balance2, AccountType.BANK_ACCOUNT, "desc2");
        
        AccountName name3 = AccountName.of("A3");
        Money balance3 = Money.of(BigDecimal.valueOf(200), CurrencyCode.of("USD"));
        Account a3 = new Account(name3, balance3, AccountType.CREDIT_CARD, "desc3");
        
        when(accountRepository.findAll()).thenReturn(Arrays.asList(a1, a2, a3));

        BigDecimal total = accountService.getTotalBalanceOfActiveAccounts();

        assertEquals(0, total.compareTo(BigDecimal.valueOf(300)));
        verify(accountRepository).findAll();
    }
}
