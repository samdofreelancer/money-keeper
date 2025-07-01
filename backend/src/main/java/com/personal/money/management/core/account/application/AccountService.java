package com.personal.money.management.core.account.application;

import com.personal.money.management.core.account.domain.model.Account;
import com.personal.money.management.core.account.domain.repository.AccountRepository;
import com.personal.money.management.core.account.application.exception.AccountNotFoundException;
import com.personal.money.management.core.account.application.exception.DuplicateAccountNameException;
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
        accountRepository.findByAccountName(account.getAccountName())
            .ifPresent(existing -> {
                throw new DuplicateAccountNameException("Account name already exists: " + account.getAccountName());
            });
        return accountRepository.save(account);
    }

    public Account updateAccount(Long id, Account updatedAccount) {
        return accountRepository.findById(id)
                .map(existingAccount -> {
                    // Create a new Account instance with the existing ID and updated fields
                    Account newAccount = Account.reconstruct(
                            existingAccount.getId(),
                            updatedAccount.getAccountName(),
                            updatedAccount.getInitBalance(),
                            updatedAccount.getType(),
                            updatedAccount.getCurrency(),
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
                // Assuming active accounts are those with non-null and positive initBalance
                .filter(account -> account.getInitBalance() != null && account.getInitBalance().compareTo(BigDecimal.ZERO) > 0)
                .toList();

        return activeAccounts.stream()
                .map(Account::getInitBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
