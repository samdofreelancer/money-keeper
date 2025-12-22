package com.personal.money.management.core.tax.application;

import com.personal.money.management.core.tax.domain.model.*;
import com.personal.money.management.core.tax.domain.service.TaxCalculationService;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

/**
 * Application Service for Tax Calculator Use Cases
 * Orchestrates domain services and handles cross-cutting concerns
 */
@Service
public class TaxCalculatorApplicationService {
    
    private final TaxCalculationService taxCalculationService;

    public TaxCalculatorApplicationService() {
        this.taxCalculationService = new TaxCalculationService();
    }

    @Bean
    public TaxCalculationService taxCalculationService() {
        return new TaxCalculationService();
    }

    /**
     * Calculate salary and tax based on provided input
     */
    public SalaryCalculationResult calculateSalaryTax(SalaryCalculationRequest request) {
        // Build input value object
        SalaryCalculationInput input = new SalaryCalculationInput(
            request.getGrossSalary(),
            request.getTetBonus(),
            request.getInsuranceBase() > 0 ? request.getInsuranceBase() : 46_800_000, // Default: 20 × 2.340.000
            Math.min(request.getDependents(), 10), // Max 10 dependents
            request.getBhxhRate(),
            request.getBhytRate(),
            request.getBhtnRate(),
            request.getPersonalDeduction() > 0 ? request.getPersonalDeduction() : 11_000_000,
            request.getDependentDeductionPerPerson() > 0 ? request.getDependentDeductionPerPerson() : 4_400_000,
            request.getTaxFreeAllowance(),
            request.getOtherDeduction(),
            TaxBracketType.fromCode(request.getTaxBracketType()),
            WageZone.fromCode(request.getWageZone())
        );

        // Calculate using domain service
        return taxCalculationService.calculateSalary(input);
    }
}
