package com.personal.money.management.tax.application;

import com.personal.money.management.tax.domain.model.AnnualTaxSettlementInput;
import com.personal.money.management.tax.domain.model.AnnualTaxSettlementResult;
import com.personal.money.management.tax.domain.service.AnnualTaxSettlementService;
import org.springframework.stereotype.Service;

/**
 * Application Service for Annual Tax Settlement Use Cases
 */
@Service
public class AnnualTaxSettlementApplicationService {
    
    private final AnnualTaxSettlementService annualTaxSettlementService;
    
    public AnnualTaxSettlementApplicationService() {
        this.annualTaxSettlementService = new AnnualTaxSettlementService();
    }
    
    /**
     * Calculate annual tax settlement based on provided input
     * 
     * @param request The annual tax settlement request from frontend
     * @return The calculated annual tax settlement result
     */
    public AnnualTaxSettlementResult calculateAnnualTaxSettlement(AnnualTaxSettlementRequest request) {
        // Validate required fields
        if (request.getYear() == null || request.getYear().isEmpty()) {
            throw new IllegalArgumentException("Year is required");
        }
        
        if (request.getTotalGrossSalary() <= 0) {
            throw new IllegalArgumentException("Total gross salary must be greater than 0");
        }
        
        if (request.getPersonalDeduction() <= 0) {
            throw new IllegalArgumentException("Personal deduction must be greater than 0");
        }
        
        if (request.getDependentDeduction() <= 0) {
            throw new IllegalArgumentException("Dependent deduction must be greater than 0");
        }
        
        if (request.getNumberOfDependents() < 0) {
            throw new IllegalArgumentException("Number of dependents cannot be negative");
        }
        
        if (request.getNumberOfDependents() > 10) {
            throw new IllegalArgumentException("Maximum 10 dependents allowed");
        }
        
        // Create input value object
        AnnualTaxSettlementInput input = new AnnualTaxSettlementInput(
            request.getYear(),
            request.getTotalGrossSalary(),
            request.getTotalBonus(),
            request.getPersonalDeduction(),
            request.getDependentDeduction(),
            request.getNumberOfDependents(),
            request.getTaxFreeAllowance(),
            request.getOtherDeduction(),
            request.getBhxhContribution(),
            request.getBhytContribution(),
            request.getBhtnContribution(),
            request.getTaxAlreadyPaid()
        );
        
        // Calculate using domain service
        return annualTaxSettlementService.calculateAnnualTaxSettlement(input);
    }
}
