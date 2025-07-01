package com.personal.money.management.core.account.infrastructure.persistence;

import com.personal.money.management.core.account.domain.model.Currency;
import com.personal.money.management.core.account.domain.repository.CurrencyRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class CurrencyRepositoryImpl implements CurrencyRepository {
    private final CurrencyJpaRepository jpaRepository;

    public CurrencyRepositoryImpl(CurrencyJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Currency> findAll() {
        return jpaRepository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public Optional<Currency> findByCode(String code) {
        CurrencyEntity entity = jpaRepository.findByCode(code);
        return entity != null ? Optional.of(toDomain(entity)) : Optional.empty();
    }

    @Override
    public boolean existsByCode(String code) {
        return jpaRepository.existsByCode(code);
    }

    @Override
    public Currency save(Currency currency) {
        CurrencyEntity entity = new CurrencyEntity();
        entity.setCode(currency.getCode());
        entity.setName(currency.getName());
        CurrencyEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    private Currency toDomain(CurrencyEntity entity) {
        return new Currency(entity.getId(), entity.getCode(), entity.getName());
    }
}
