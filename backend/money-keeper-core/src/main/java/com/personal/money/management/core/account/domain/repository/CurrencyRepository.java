package com.personal.money.management.core.account.domain.repository;

import com.personal.money.management.core.account.domain.model.Currency;
import java.util.List;

public interface CurrencyRepository {
    List<Currency> findAll();
    Currency save(Currency currency);
}
