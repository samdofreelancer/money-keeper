package com.personal.money.management.core.account.infrastructure.persistence;

import com.personal.money.management.core.account.domain.model.Account;
import com.personal.money.management.core.account.domain.repository.AccountRepository;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class AccountRepositoryImpl implements AccountRepository {

    private final AccountJpaRepository jpaRepository;

    public AccountRepositoryImpl(AccountJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Account save(Account account) {
        AccountEntity entity = toEntity(account);
        AccountEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Account> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Account> findAll() {
        return jpaRepository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public Optional<Account> findByAccountName(String accountName) {
        return jpaRepository.findAll().stream()
            .filter(e -> e.getAccountName().equalsIgnoreCase(accountName))
            .findFirst()
            .map(this::toDomain);
    }

    private Account toDomain(AccountEntity entity) {
        return Account.reconstruct(
                entity.getId(),
                entity.getAccountName(),
                entity.getInitBalance(),
                entity.getType(),
                entity.getCurrency(),
                entity.getDescription(),
                entity.isActive()
        );
    }

    private AccountEntity toEntity(Account account) {
        AccountEntity entity = new AccountEntity();
        if (account.getId() != null) {
            entity.setId(account.getId());
        }
        entity.setAccountName(account.getAccountName());
        entity.setInitBalance(account.getInitBalance());
        entity.setType(account.getType());
        entity.setCurrency(account.getCurrency());
        entity.setDescription(account.getDescription());
        entity.setActive(account.isActive()); // Always set from domain
        return entity;
    }
}
