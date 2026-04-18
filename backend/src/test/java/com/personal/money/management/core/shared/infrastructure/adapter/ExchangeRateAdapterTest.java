package com.personal.money.management.core.shared.infrastructure.adapter;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("ExchangeRateAdapter Anti-Corruption Layer Tests")
class ExchangeRateAdapterTest {
    
    private final ExchangeRateAdapter adapter = new StubExchangeRateAdapter();
    
    @Test
    @DisplayName("Should provide USD to VND exchange rate")
    void testUsdToVndExchangeRate() {
        BigDecimal rate = adapter.getExchangeRate("USD", "VND", LocalDate.now());
        
        assertNotNull(rate);
        assertEquals(BigDecimal.valueOf(24500), rate);
    }
    
    @Test
    @DisplayName("Should provide EUR to VND exchange rate")
    void testEurToVndExchangeRate() {
        BigDecimal rate = adapter.getExchangeRate("EUR", "VND", LocalDate.now());
        
        assertNotNull(rate);
        assertEquals(BigDecimal.valueOf(26500), rate);
    }
    
    @Test
    @DisplayName("Should return 1.0 for same currency conversion")
    void testSameCurrencyExchangeRate() {
        BigDecimal rate = adapter.getExchangeRate("USD", "USD", LocalDate.now());
        
        assertNotNull(rate);
        assertEquals(BigDecimal.ONE, rate);
    }
    
    @Test
    @DisplayName("Should throw exception for unsupported currency pair")
    void testUnsupportedCurrencyPair() {
        assertThrows(ExchangeRateException.class, () ->
            adapter.getExchangeRate("GBP", "JPY", LocalDate.now())
        );
    }
    
    @Test
    @DisplayName("Should provide current exchange rate")
    void testGetCurrentExchangeRate() {
        BigDecimal currentRate = adapter.getCurrentExchangeRate("USD", "VND");
        BigDecimal historicalRate = adapter.getExchangeRate("USD", "VND", LocalDate.now());
        
        assertEquals(currentRate, historicalRate);
    }
    
    @Test
    @DisplayName("Should indicate adapter availability")
    void testAdapterAvailability() {
        assertTrue(adapter.isAvailable());
    }
    
    @Test
    @DisplayName("Anti-corruption layer shields domain from external API details")
    void testAntiCorruptionLayerIsolation() {
        // Domain code only sees adapter interface, never external API structure
        ExchangeRateAdapter adapter = new StubExchangeRateAdapter();
        
        // Domain work is isolated from external service details
        BigDecimal rate = adapter.getExchangeRate("USD", "VND", LocalDate.now());
        
        // Domain receives transformed, verified data
        assertNotNull(rate);
        assertTrue(rate.compareTo(BigDecimal.ZERO) > 0);
    }
}
