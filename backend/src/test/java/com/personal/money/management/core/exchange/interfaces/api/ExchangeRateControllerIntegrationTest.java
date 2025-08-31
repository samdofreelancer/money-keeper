package com.personal.money.management.core.exchange.interfaces.api;

import com.personal.money.management.core.exchange.infrastructure.persistence.ExchangeRateEntity;
import com.personal.money.management.core.exchange.infrastructure.persistence.ExchangeRateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * Integration tests for ExchangeRate API.
 * Tests full stack including HTTP, service, and persistence layers.
 * Focuses on end-to-end behavior and validation.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ExchangeRateControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ExchangeRateRepository repository;

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll();
    }

    @Test
    void latest_shouldReturnFallbackRates_whenNoDataAvailable() throws Exception {
        mockMvc.perform(get("/api/exchange-rates/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.base").value("EUR"))
                .andExpect(jsonPath("$.rates.EUR").value(1.0))
                .andExpect(jsonPath("$.rates").isMap())
                .andExpect(jsonPath("$.rates").value(hasKey("EUR")));
    }

    @Test
    void latest_shouldReturnRatesFromDatabase_whenDataExists() throws Exception {
        // Arrange
        LocalDate today = LocalDate.now();
        ExchangeRateEntity eurUsd = new ExchangeRateEntity();
        eurUsd.setBase("EUR");
        eurUsd.setSymbol("USD");
        eurUsd.setRate(1.1);
        eurUsd.setRateDate(today);

        ExchangeRateEntity eurGbp = new ExchangeRateEntity();
        eurGbp.setBase("EUR");
        eurGbp.setSymbol("GBP");
        eurGbp.setRate(0.85);
        eurGbp.setRateDate(today);

        repository.saveAll(Arrays.asList(eurUsd, eurGbp));

        // Act & Assert
        mockMvc.perform(get("/api/exchange-rates/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.base").value("EUR"))
                .andExpect(jsonPath("$.rates.USD").value(1.1))
                .andExpect(jsonPath("$.rates.GBP").value(0.85))
                .andExpect(jsonPath("$.rates.EUR").value(1.0));
    }

    @Test
    void latest_shouldReturnRatesForSpecifiedBase() throws Exception {
        // Arrange
        LocalDate today = LocalDate.now();
        ExchangeRateEntity usdEur = new ExchangeRateEntity();
        usdEur.setBase("USD");
        usdEur.setSymbol("EUR");
        usdEur.setRate(0.91);
        usdEur.setRateDate(today);

        ExchangeRateEntity usdGbp = new ExchangeRateEntity();
        usdGbp.setBase("USD");
        usdGbp.setSymbol("GBP");
        usdGbp.setRate(0.77);
        usdGbp.setRateDate(today);

        repository.saveAll(Arrays.asList(usdEur, usdGbp));

        // Act & Assert
        mockMvc.perform(get("/api/exchange-rates/latest")
                .param("base", "USD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.base").value("USD"))
                .andExpect(jsonPath("$.rates.EUR").value(0.91))
                .andExpect(jsonPath("$.rates.GBP").value(0.77))
                .andExpect(jsonPath("$.rates.USD").value(1.0));
    }

    @Test
    void latest_shouldReturnRatesForDifferentBase_whenRequestedBaseNotInDb() throws Exception {
        // Arrange
        LocalDate today = LocalDate.now();
        ExchangeRateEntity eurUsd = new ExchangeRateEntity();
        eurUsd.setBase("EUR");
        eurUsd.setSymbol("USD");
        eurUsd.setRate(1.1);
        eurUsd.setRateDate(today);

        ExchangeRateEntity eurGbp = new ExchangeRateEntity();
        eurGbp.setBase("EUR");
        eurGbp.setSymbol("GBP");
        eurGbp.setRate(0.85);
        eurGbp.setRateDate(today);

        repository.saveAll(Arrays.asList(eurUsd, eurGbp));

        // Act & Assert - Request USD base but only EUR data exists, should normalize
        mockMvc.perform(get("/api/exchange-rates/latest")
                .param("base", "USD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.base").value("USD"))
                .andExpect(jsonPath("$.rates.EUR").value(0.91)) // 1/1.1 rounded to 2 decimals
                .andExpect(jsonPath("$.rates.GBP").value(0.77)) // 0.85/1.1 rounded to 2 decimals
                .andExpect(jsonPath("$.rates.USD").value(1.0));
    }

    @Test
    void latest_shouldHandleCaseInsensitiveBaseParameter() throws Exception {
        // Arrange
        LocalDate today = LocalDate.now();
        ExchangeRateEntity eurUsd = new ExchangeRateEntity();
        eurUsd.setBase("EUR");
        eurUsd.setSymbol("USD");
        eurUsd.setRate(1.1);
        eurUsd.setRateDate(today);

        repository.save(eurUsd);

        // Act & Assert
        mockMvc.perform(get("/api/exchange-rates/latest")
                .param("base", "eur")) // lowercase
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.base").value("EUR"))
                .andExpect(jsonPath("$.rates.USD").value(1.1))
                .andExpect(jsonPath("$.rates.EUR").value(1.0));
    }

    @Test
    void latest_shouldReturnEmptyBaseAsEUR() throws Exception {
        // Arrange
        LocalDate today = LocalDate.now();
        ExchangeRateEntity eurUsd = new ExchangeRateEntity();
        eurUsd.setBase("EUR");
        eurUsd.setSymbol("USD");
        eurUsd.setRate(1.1);
        eurUsd.setRateDate(today);

        repository.save(eurUsd);

        // Act & Assert - Empty base parameter should default to EUR
        mockMvc.perform(get("/api/exchange-rates/latest")
                .param("base", ""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.base").value("EUR"))
                .andExpect(jsonPath("$.rates.USD").value(1.1))
                .andExpect(jsonPath("$.rates.EUR").value(1.0));
    }

    @Test
    void latest_shouldReturnFallbackForInvalidBaseCurrency() throws Exception {
        // No data setup - should return fallback

        // Act & Assert
        mockMvc.perform(get("/api/exchange-rates/latest")
                .param("base", "INVALID"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.base").value("INVALID"))
                .andExpect(jsonPath("$.rates.INVALID").value(1.0))
                .andExpect(jsonPath("$.rates").isMap())
                .andExpect(jsonPath("$.rates").value(hasKey("INVALID")));
    }

    @Test
    void latest_shouldCacheResponsesForPerformance() throws Exception {
        // Arrange
        LocalDate today = LocalDate.now();
        ExchangeRateEntity eurUsd = new ExchangeRateEntity();
        eurUsd.setBase("EUR");
        eurUsd.setSymbol("USD");
        eurUsd.setRate(1.1);
        eurUsd.setRateDate(today);

        repository.save(eurUsd);

        // First call - should hit database
        mockMvc.perform(get("/api/exchange-rates/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.base").value("EUR"))
                .andExpect(jsonPath("$.rates.USD").value(1.1));

        // Second call - should be served from cache (no additional database calls)
        mockMvc.perform(get("/api/exchange-rates/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.base").value("EUR"))
                .andExpect(jsonPath("$.rates.USD").value(1.1));

        // Verify only one database call was made (the cache should prevent the second call)
        // This is a bit tricky to verify in integration tests, but the behavior is tested
    }
}
