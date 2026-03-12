package com.personal.money.management.tax.interfaces.api;

import com.personal.money.management.tax.application.TaxService;
import com.personal.money.management.tax.domain.model.TaxBracket;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

/**
 * Tax API Controller
 * REST endpoints for tax calculations
 */
@RestController
@RequestMapping("/api/tax")
public class TaxController {
    
    private final TaxService taxService;
    
    public TaxController(TaxService taxService) {
        this.taxService = taxService;
    }
    
    @PostMapping("/calculate")
    public TaxCalculationResponse calculateTax(
            @RequestParam BigDecimal income,
            @RequestBody List<TaxBracket> brackets) {
        
        BigDecimal tax = taxService.calculateTax(income, brackets);
        BigDecimal effectiveRate = taxService.getEffectiveRate(income, tax);
        
        return new TaxCalculationResponse(income, tax, effectiveRate);
    }
}
