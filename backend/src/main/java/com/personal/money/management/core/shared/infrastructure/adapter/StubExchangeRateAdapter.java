package com.personal.money.management.core.shared.infrastructure.adapter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Stub implementation of ExchangeRateAdapter for testing and development.
 * 
 * This implementation demonstrates how to implement the anti-corruption layer
 * for exchange rate services. In production, you would replace this with
 * calls to an actual exchange rate API.
 */
public class StubExchangeRateAdapter implements ExchangeRateAdapter {
    
    @Override
    public BigDecimal getExchangeRate(String sourceCurrency, String targetCurrency, LocalDate date) {
        // Stub rates for demonstration
        if ("USD".equals(sourceCurrency) && "VND".equals(targetCurrency)) {
            return BigDecimal.valueOf(24500);  // 1 USD = 24500 VND (approximate)
        }
        if ("EUR".equals(sourceCurrency) && "VND".equals(targetCurrency)) {
            return BigDecimal.valueOf(26500);  // 1 EUR = 26500 VND (approximate)
        }
        if (sourceCurrency.equals(targetCurrency)) {
            return BigDecimal.ONE;
        }
        throw new ExchangeRateException("Exchange rate not available for " + sourceCurrency + "/" + targetCurrency);
    }
    
    @Override
    public BigDecimal getCurrentExchangeRate(String sourceCurrency, String targetCurrency) {
        return getExchangeRate(sourceCurrency, targetCurrency, LocalDate.now());
    }
    
    @Override
    public boolean isAvailable() {
        return true;  // In production, this would check the actual service health
    }
}
