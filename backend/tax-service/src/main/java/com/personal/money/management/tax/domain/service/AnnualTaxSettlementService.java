package com.personal.money.management.tax.domain.service;

import com.personal.money.management.tax.domain.model.AnnualTaxSettlementInput;
import com.personal.money.management.tax.domain.model.AnnualTaxSettlementResult;

/**
 * Domain Service for Annual Tax Settlement Calculation
 * Calculates annual tax liability based on yearly income and deductions
 */
public class AnnualTaxSettlementService {
    
    public AnnualTaxSettlementService() {
    }
    
    /**
     * Calculate annual tax settlement
     * 
     * Formula:
     * 1. Total Income = Gross Salary + Bonus
     * 2. Total Deductions = Personal + (Dependent × Number) + Other + Insurance
     * 3. Taxable Income = Total Income - Total Deductions
     * 4. Calculate Tax based on Taxable Income using tax brackets
     * 5. Tax Due = Calculated Tax - Tax Already Paid
     *    - If positive: taxpayer owes tax
     *    - If negative: taxpayer gets refund
     *    - If zero: balanced
     * 
     * @param input Annual tax settlement input
     * @return Annual tax settlement result with calculated tax and amount due
     */
    public AnnualTaxSettlementResult calculateAnnualTaxSettlement(AnnualTaxSettlementInput input) {
        // Step 1: Calculate total income
        long totalIncome = input.getTotalGrossSalary() + input.getTotalBonus();
        
        // Step 2: Calculate total deductions
        long dependentDeductionTotal = input.getDependentDeduction() * input.getNumberOfDependents();
        long totalDeductions = input.getPersonalDeduction() + 
                              dependentDeductionTotal + 
                              input.getOtherDeduction();
        
        // Step 3: Calculate taxable income (should not be negative)
        long taxableIncome = Math.max(0, totalIncome - totalDeductions);
        
        // Step 4: Calculate tax based on taxable income
        // Use the 5-bracket system for annual settlement (standard in Vietnam)
        // Or determine bracket based on year
        long calculatedTax = calculateTaxOnIncome(taxableIncome);
        
        // Step 5: Subtract insurance contributions (deductible)
        long insuranceContributions = input.getBhxhContribution() + 
                                     input.getBhytContribution() + 
                                     input.getBhtnContribution();
        long taxAfterInsurance = Math.max(0, calculatedTax - insuranceContributions);
        
        // Step 6: Calculate tax due
        long taxDue = taxAfterInsurance - input.getTaxAlreadyPaid();
        
        // Step 7: Determine settlement status
        String settlementStatus;
        if (taxDue > 0) {
            settlementStatus = "due";  // Phải nộp
        } else if (taxDue < 0) {
            settlementStatus = "refund";  // Được hoàn lại
        } else {
            settlementStatus = "balanced";  // Cân bằng
        }
        
        return new AnnualTaxSettlementResult(
            input.getYear(),
            totalIncome,
            totalDeductions,
            taxableIncome,
            taxAfterInsurance,
            input.getTaxAlreadyPaid(),
            taxDue,
            settlementStatus,
            input.getPersonalDeduction(),
            dependentDeductionTotal,
            input.getOtherDeduction(),
            insuranceContributions
        );
    }
    
    /**
     * Calculate tax based on taxable income using 5-bracket system
     * Vietnam's standard tax brackets for income tax
     * 
     * Brackets:
     * 0 - 10M: 5%
     * 10M - 30M: 10%
     * 30M - 60M: 20%
     * 60M - 100M: 30%
     * 100M+: 35%
     * 
     * @param taxableIncome The taxable income amount
     * @return Calculated tax amount
     */
    private long calculateTaxOnIncome(long taxableIncome) {
        if (taxableIncome <= 0) {
            return 0;
        }
        
        long tax = 0;
        
        if (taxableIncome <= 10_000_000) {
            tax = (long) (taxableIncome * 0.05);
        } else if (taxableIncome <= 30_000_000) {
            tax = (long) (10_000_000 * 0.05 + (taxableIncome - 10_000_000) * 0.10);
        } else if (taxableIncome <= 60_000_000) {
            tax = (long) (10_000_000 * 0.05 + 20_000_000 * 0.10 + (taxableIncome - 30_000_000) * 0.20);
        } else if (taxableIncome <= 100_000_000) {
            tax = (long) (10_000_000 * 0.05 + 20_000_000 * 0.10 + 30_000_000 * 0.20 + (taxableIncome - 60_000_000) * 0.30);
        } else {
            tax = (long) (10_000_000 * 0.05 + 20_000_000 * 0.10 + 30_000_000 * 0.20 + 40_000_000 * 0.30 + (taxableIncome - 100_000_000) * 0.35);
        }
        
        return tax;
    }
}
