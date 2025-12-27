package com.personal.money.management.core.account.application;

import com.personal.money.management.core.account.domain.model.Currency;
import com.personal.money.management.core.account.domain.repository.CurrencyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CurrencyServiceTest {

    private CurrencyRepository currencyRepository;
    private CurrencyService currencyService;

    @BeforeEach
    void setUp() {
        currencyRepository = mock(CurrencyRepository.class);
        currencyService = new CurrencyService(currencyRepository);
    }

    @Test
    void getAllCurrencies_shouldReturnListFromRepository() {
        Currency c1 = new Currency(null, "USD", "US Dollar", "$", "flag1");
        Currency c2 = new Currency(null, "EUR", "Euro", "€", "flag2");

        when(currencyRepository.findAll()).thenReturn(List.of(c1, c2));

        List<Currency> result = currencyService.getAllCurrencies();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("USD", result.get(0).getCode());
        verify(currencyRepository).findAll();
    }
}
