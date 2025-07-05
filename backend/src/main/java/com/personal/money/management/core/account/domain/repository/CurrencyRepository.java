package com.personal.money.management.core.account.domain.repository;

import com.personal.money.management.core.account.domain.model.Currency;
import java.util.List;
import java.util.Optional;

public interface CurrencyRepository {
    List<Currency> findAll();
    Optional<Currency> findByCode(String code);
    boolean existsByCode(String code);
    Currency save(Currency currency);
}
