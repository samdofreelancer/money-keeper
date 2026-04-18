package com.personal.money.management.core.shared.infrastructure.adapter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Stub implementation of TaxAuthorityAdapter for testing and development.
 * 
 * This implementation demonstrates how to implement the anti-corruption layer
 * for tax authority services. In production, you would replace this with
 * calls to an actual tax authority API or provider.
 */
public class StubTaxAuthorityAdapter implements TaxAuthorityAdapter {
    
    @Override
    public BigDecimal getEffectiveTaxRate(String jurisdiction, BigDecimal annualIncome, LocalDate taxDate) {
        // Stub rates for demonstration - simplified Vietnam tax brackets
        if ("vn".equals(jurisdiction)) {
            if (annualIncome.compareTo(BigDecimal.valueOf(5_000_000)) <= 0) {
                return BigDecimal.valueOf(0.05);  // 5% for income up to 5M
            } else if (annualIncome.compareTo(BigDecimal.valueOf(10_000_000)) <= 0) {
                return BigDecimal.valueOf(0.10);  // 10% for income 5M-10M
            } else {
                return BigDecimal.valueOf(0.20);  // 20% for income over 10M
            }
        }
        throw new TaxAuthorityException("Jurisdiction not supported: " + jurisdiction);
    }
    
    @Override
    public BigDecimal getNextTaxBracket(String jurisdiction, BigDecimal currentIncome, LocalDate taxDate) {
        if ("vn".equals(jurisdiction)) {
            if (currentIncome.compareTo(BigDecimal.valueOf(5_000_000)) < 0) {
                return BigDecimal.valueOf(5_000_000);
            } else if (currentIncome.compareTo(BigDecimal.valueOf(10_000_000)) < 0) {
                return BigDecimal.valueOf(10_000_000);
            }
        }
        throw new TaxAuthorityException("Jurisdiction not supported: " + jurisdiction);
    }
    
    @Override
    public boolean supportsJurisdiction(String jurisdiction) {
        return "vn".equals(jurisdiction);
    }
    
    @Override
    public boolean isAvailable() {
        return true;  // In production, this would check the actual service health
    }
}
