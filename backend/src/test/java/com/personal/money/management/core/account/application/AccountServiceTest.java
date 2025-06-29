package com.personal.money.management.core.account.application;

import com.personal.money.management.core.account.application.exception.AccountNotFoundException;
import com.personal.money.management.core.account.domain.model.Account;
import com.personal.money.management.core.account.domain.model.AccountType;
import com.personal.money.management.core.account.domain.repository.AccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import javax.validation.ConstraintViolationException;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AccountServiceTest {

    private AccountRepository accountRepository;
    private AccountService accountService;
    private Validator validator;

    @BeforeEach
    void setUp() {
        accountRepository = mock(AccountRepository.class);
        accountService = new AccountService(accountRepository);
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testCreateAccount() {
        Account account = new Account("Test Account", BigDecimal.valueOf(100), AccountType.CASH, "USD", "desc");
        when(accountRepository.save(account)).thenReturn(account);

        Account created = accountService.createAccount(account);

        assertEquals(account, created);
        verify(accountRepository).save(account);
    }

    @Test
    void testCreateAccount_Invalid() {
        Account account = new Account("", BigDecimal.valueOf(-10), null, "", "desc");

        var violations = validator.validate(account);
        assertFalse(violations.isEmpty());
    }

    @Test
    void testUpdateAccount_Success() {
        Long id = 1L;
        Account existing = new Account("Old Account", BigDecimal.valueOf(50), AccountType.BANK_ACCOUNT, "USD", "old desc");
        Account updated = new Account("New Account", BigDecimal.valueOf(150), AccountType.CREDIT_CARD, "USD", "new desc");

        when(accountRepository.findById(id)).thenReturn(Optional.of(existing));
        when(accountRepository.save(existing)).thenReturn(existing);

        Account result = accountService.updateAccount(id, updated);

        assertEquals("New Account", result.getAccountName());
        assertEquals(BigDecimal.valueOf(150), result.getInitBalance());
        assertEquals(AccountType.CREDIT_CARD, result.getType());
        assertEquals("new desc", result.getDescription());
        verify(accountRepository).findById(id);
        verify(accountRepository).save(existing);
    }

    @Test
    void testUpdateAccount_NotFound() {
        Long id = 1L;
        Account updated = new Account("New Account", BigDecimal.valueOf(150), AccountType.CREDIT_CARD, "USD", "new desc");

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
        Account a1 = new Account("A1", BigDecimal.valueOf(100), AccountType.CASH, "USD", "desc1");
        Account a2 = new Account("A2", BigDecimal.valueOf(200), AccountType.BANK_ACCOUNT, "USD", "desc2");
        when(accountRepository.findAll()).thenReturn(Arrays.asList(a1, a2));

        List<Account> accounts = accountService.listAccounts();

        assertEquals(2, accounts.size());
        verify(accountRepository).findAll();
    }

    @Test
    void testGetTotalBalanceOfActiveAccounts() {
        Account a1 = new Account("A1", BigDecimal.valueOf(100), AccountType.CASH, "USD", "desc1");
        Account a2 = new Account("A2", BigDecimal.valueOf(0), AccountType.BANK_ACCOUNT, "USD", "desc2");
        Account a3 = new Account("A3", BigDecimal.valueOf(200), AccountType.CREDIT_CARD, "USD", "desc3");
        when(accountRepository.findAll()).thenReturn(Arrays.asList(a1, a2, a3));

        BigDecimal total = accountService.getTotalBalanceOfActiveAccounts();

        assertEquals(BigDecimal.valueOf(300), total);
        verify(accountRepository).findAll();
    }
}
