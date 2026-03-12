package com.personal.money.management.service.account.domain.repository;

import com.personal.money.management.service.account.domain.model.Account;
import java.util.List;
import java.util.Optional;

public interface AccountRepository {
    Account save(Account account);
    Optional<Account> findById(Long id);
    List<Account> findAll();
    void deleteById(Long id);
    Optional<Account> findByAccountName(String accountName);
}
