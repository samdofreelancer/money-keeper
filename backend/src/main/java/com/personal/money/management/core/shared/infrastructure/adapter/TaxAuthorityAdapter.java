package com.personal.money.management.core.shared.infrastructure.adapter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Anti-Corruption Layer: TaxAuthorityAdapter
 * 
 * This adapter defines the contract for external tax authority service integrations.
 * It acts as a boundary between our internal domain model and external tax information providers.
 * 
 * Purpose:
 * - Isolate tax calculation API details from our domain logic
 * - Transform external API responses into our internal tax domain models
 * - Provide a stable interface that won't break if external providers change
 * 
 * Benefits:
 * - Domain doesn't depend on external tax service structure
 * - Easy to switch tax information providers
 * - Easy to mock in tests
 * - Clear transformation point for tax bracket and rate validation
 * 
 * Example external providers:
 * - Country tax authority APIs
 * - TaxJar API
 * - Avalara tax service
 * - Official government tax bracket APIs
 */
public interface TaxAuthorityAdapter {
    
    /**
     * Fetch effective tax rate for given annual income and tax jurisdiction as of a specific date.
     * 
     * This method shields the domain from:
     * - External tax authority API response structure
     * - Tax jurisdiction code mappings
     * - External API error handling
     * - Tax year normalization
     * 
     * @param jurisdiction tax jurisdiction code (e.g., "vn" for Vietnam, "us-ca" for California)
     * @param annualIncome the annual income amount
     * @param taxDate the date to fetch tax rates for
     * @return the effective tax rate (e.g., 0.25 for 25%)
     * @throws TaxAuthorityException if external service unavailable or jurisdiction not found
     */
    BigDecimal getEffectiveTaxRate(String jurisdiction, BigDecimal annualIncome, LocalDate taxDate);
    
    /**
     * Fetch the next tax bracket threshold above the given income level.
     * 
     * Useful for tax planning and predictions.
     * 
     * @param jurisdiction tax jurisdiction code
     * @param currentIncome the current income level
     * @param taxDate the date to fetch tax brackets for
     * @return the next tax bracket threshold (e.g., if income is 1M, returns 1.5M if next bracket at 1.5M)
     * @throws TaxAuthorityException if unavailable
     */
    BigDecimal getNextTaxBracket(String jurisdiction, BigDecimal currentIncome, LocalDate taxDate);
    
    /**
     * Validate if a jurisdiction code is supported by the tax authority adapter.
     * 
     * @param jurisdiction tax jurisdiction code
     * @return true if jurisdiction is supported
     */
    boolean supportsJurisdiction(String jurisdiction);
    
    /**
     * Check if the adapter is currently available (e.g., external service is reachable).
     * 
     * This allows graceful degradation if external tax service is down.
     * 
     * @return true if the adapter is operational
     */
    boolean isAvailable();
}
