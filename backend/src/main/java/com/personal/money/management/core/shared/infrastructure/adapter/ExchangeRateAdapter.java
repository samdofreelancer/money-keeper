package com.personal.money.management.core.shared.infrastructure.adapter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Anti-Corruption Layer: ExchangeRateAdapter
 * 
 * This adapter defines the contract for external exchange rate service integrations.
 * It acts as a boundary between our internal domain model and external exchange rate providers.
 * 
 * Purpose:
 * - Isolate exchange rate API details from our domain logic
 * - Transform external API responses into our internal domain models
 * - Provide a stable interface that won't break if external providers change
 * 
 * Benefits:
 * - Domain doesn't depend on external service structure
 * - Easy to switch exchange rate providers
 * - Easy to mock in tests
 * - Clear transformation point for validation and mapping
 * 
 * Example external providers:
 * - OpenExchangeRates API
 * - Fixer.io API
 * - CurrencyLayer API
 */
public interface ExchangeRateAdapter {
    
    /**
     * Fetch exchange rate from source currency to target currency as of a specific date.
     * 
     * This method shields the domain from:
     * - External API response structure
     * - External API error handling
     * - Network communication details
     * - Date/timezone normalization
     * 
     * @param sourceCurrency ISO 4217 currency code (e.g., "USD", "EUR")
     * @param targetCurrency ISO 4217 currency code (e.g., "VND")
     * @param date the date to fetch rates for
     * @return the exchange rate (e.g., 1 USD = 24500 VND)
     * @throws ExchangeRateException if external service unavailable or rate not found
     */
    BigDecimal getExchangeRate(String sourceCurrency, String targetCurrency, LocalDate date);
    
    /**
     * Fetch current exchange rate (real-time or latest available).
     * 
     * @param sourceCurrency ISO 4217 currency code
     * @param targetCurrency ISO 4217 currency code
     * @return the current exchange rate
     * @throws ExchangeRateException if external service unavailable
     */
    BigDecimal getCurrentExchangeRate(String sourceCurrency, String targetCurrency);
    
    /**
     * Check if the adapter is currently available (e.g., external service is reachable).
     * 
     * This allows graceful degradation if external service is down.
     * 
     * @return true if the adapter is operational
     */
    boolean isAvailable();
}
