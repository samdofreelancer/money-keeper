package com.personal.money.management.service.account.application;

import com.personal.money.management.service.account.domain.model.Currency;
import com.personal.money.management.service.account.domain.repository.CurrencyRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CurrencyService {
    private final CurrencyRepository currencyRepository;

    public CurrencyService(CurrencyRepository currencyRepository) {
        this.currencyRepository = currencyRepository;
    }

    public List<Currency> getAllCurrencies() {
        return currencyRepository.findAll();
    }
}
