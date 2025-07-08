package com.personal.money.management.core.account.infrastructure.persistence;

import com.personal.money.management.core.account.domain.model.Account;
import com.personal.money.management.core.account.domain.repository.AccountRepository;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class AccountRepositoryImpl implements AccountRepository {

    private final AccountJpaRepository jpaRepository;
    private final AccountMapper mapper;

    public AccountRepositoryImpl(AccountJpaRepository jpaRepository, AccountMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Account save(Account account) {
        AccountEntity entity = mapper.toEntity(account);
        AccountEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Account> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Account> findAll() {
        // Use batch conversion for better performance
        return mapper.toDomainList(jpaRepository.findAll());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public Optional<Account> findByAccountName(String accountName) {
        if (accountName == null || accountName.trim().isEmpty()) {
            return Optional.empty();
        }
        return jpaRepository.findByAccountNameIgnoreCase(accountName.trim())
                .map(mapper::toDomain);
    }
}