package com.personal.money.management.core.account.application;

import com.personal.money.management.core.account.domain.model.Account;
import com.personal.money.management.core.account.domain.repository.AccountRepository;
import com.personal.money.management.core.account.application.exception.AccountNotFoundException;
import com.personal.money.management.core.account.application.exception.DuplicateAccountNameException;
import com.personal.money.management.core.shared.domain.valueobject.AccountName;
import com.personal.money.management.core.shared.domain.valueobject.Money;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public Account createAccount(Account account) {
        accountRepository.findByAccountName(account.getName().getValue())
            .ifPresent(existing -> {
                throw new DuplicateAccountNameException("Account name already exists: " + account.getName().getValue());
            });
        return accountRepository.save(account);
    }

    public Account updateAccount(Long id, Account updatedAccount) {
        return accountRepository.findById(id)
                .map(existingAccount -> {
                    // Create a new Account instance with the existing ID and updated fields
                    Account newAccount = Account.reconstruct(
                            existingAccount.getId(),
                            updatedAccount.getName(),
                            updatedAccount.getInitialBalance(),
                            updatedAccount.getType(),
                            updatedAccount.getDescription(),
                            existingAccount.isActive() // preserve active status
                    );
                    // Save the new Account instance instead of mutating the existing one
                    return accountRepository.save(newAccount);
                })
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + id));
    }

    public void deleteAccount(Long id) {
        accountRepository.deleteById(id);
    }

    public List<Account> listAccounts() {
        return accountRepository.findAll();
    }

    public BigDecimal getTotalBalanceOfActiveAccounts() {
        List<Account> activeAccounts = accountRepository.findAll().stream()
                // Filter accounts with positive balance (not zero)
                .filter(account -> account.getInitialBalance() != null && !account.getInitialBalance().isZero())
                .toList();

        return activeAccounts.stream()
                .map(account -> account.getInitialBalance().getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
