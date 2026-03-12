package com.personal.money.management.tax.application;

import com.personal.money.management.tax.domain.model.TaxBracket;
import com.personal.money.management.tax.domain.service.TaxCalculationService;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

/**
 * Tax Application Service
 * Orchestrates tax calculation use cases
 */
@Service
public class TaxService {
    
    private final TaxCalculationService taxCalculationService;
    
    public TaxService() {
        this.taxCalculationService = new TaxCalculationService();
    }
    
    public BigDecimal calculateTax(BigDecimal income, List<TaxBracket> brackets) {
        return taxCalculationService.calculateTotalTax(income, brackets);
    }
    
    public BigDecimal getEffectiveRate(BigDecimal income, BigDecimal tax) {
        return taxCalculationService.getEffectiveTaxRate(income, tax);
    }
}
