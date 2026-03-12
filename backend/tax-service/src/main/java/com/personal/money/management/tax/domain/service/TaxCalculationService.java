package com.personal.money.management.tax.domain.service;

import com.personal.money.management.tax.domain.model.TaxBracket;
import java.math.BigDecimal;
import java.util.List;

/**
 * Tax Calculation Domain Service
 * Business logic for calculating taxes based on brackets
 */
public class TaxCalculationService {
    
    public BigDecimal calculateTotalTax(BigDecimal income, List<TaxBracket> brackets) {
        return brackets.stream()
            .map(bracket -> bracket.calculateTax(income))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public BigDecimal getEffectiveTaxRate(BigDecimal income, BigDecimal totalTax) {
        if (income.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return totalTax.divide(income, 4, java.math.RoundingMode.HALF_UP);
    }
}
