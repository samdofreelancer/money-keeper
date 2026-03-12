package com.personal.money.management.tax.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

/**
 * Tax Bracket Value Object
 * Represents a tax bracket with income threshold and rate
 */
@Data
@AllArgsConstructor
public class TaxBracket {
    private BigDecimal minIncome;
    private BigDecimal maxIncome;
    private BigDecimal rate;
    
    public BigDecimal calculateTax(BigDecimal income) {
        if (income.compareTo(minIncome) < 0 || income.compareTo(maxIncome) > 0) {
            return BigDecimal.ZERO;
        }
        return income.multiply(rate);
    }
}
