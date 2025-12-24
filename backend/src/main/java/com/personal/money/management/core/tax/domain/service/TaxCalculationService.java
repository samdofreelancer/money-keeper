package com.personal.money.management.core.tax.domain.service;

import com.personal.money.management.core.tax.domain.model.*;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Domain Service for tax calculations following Vietnam's personal income tax rules
 * This service contains the core business logic for tax calculation
 * 
 * Tax bracket data is loaded from database (TaxBracketEntity) for flexibility
 * Falls back to enum hardcoded values if database data is unavailable
 */
public class TaxCalculationService {
    
    private final TaxBracketRepository taxBracketRepository;
    
    public TaxCalculationService(TaxBracketRepository taxBracketRepository) {
        this.taxBracketRepository = taxBracketRepository;
    }

    /**
     * Calculate progressive tax based on taxable income and tax bracket type
     * 
     * @param taxableIncome The taxable income amount
     * @param taxBracketType The tax bracket type (7-bracket or 5-bracket)
     * @return Total tax amount (rounded)
     */
    public long calculateProgressiveTax(long taxableIncome, TaxBracketType taxBracketType) {
        if (taxableIncome <= 0) {
            return 0;
        }

        // Get brackets from database first, fall back to enum if not found
        List<TaxBracket> brackets = getFirstBracketsFromDatabaseOrEnum(taxBracketType);
        
        long tax = 0;
        long previousThreshold = 0;

        for (TaxBracket bracket : brackets) {
            if (taxableIncome > previousThreshold) {
                long taxableInThisBracket = Math.min(taxableIncome, bracket.getThreshold()) - previousThreshold;
                tax += Math.round(taxableInThisBracket * bracket.getRate());
                previousThreshold = bracket.getThreshold();
            } else {
                break;
            }
        }

        return tax;
    }
    
    /**
     * Get tax brackets from database by bracket type value
     * Falls back to enum hardcoded values if database lookup fails
     * 
     * @param taxBracketType The tax bracket type enum
     * @return List of TaxBracket objects ordered by bracket order
     */
    private List<TaxBracket> getFirstBracketsFromDatabaseOrEnum(TaxBracketType taxBracketType) {
        try {
            // Try to load from database first
            String bracketValue = taxBracketType.getCode();  // e.g., "7-bracket" or "5-bracket"
            var entityOptional = taxBracketRepository.findByValue(bracketValue);
            
            if (entityOptional.isPresent()) {
                TaxBracketEntity entity = entityOptional.get();
                if (entity.getDetails() != null && !entity.getDetails().isEmpty()) {
                    // Convert database entities to domain TaxBracket objects
                    return entity.getDetails().stream()
                        .sorted((a, b) -> a.getBracketOrder().compareTo(b.getBracketOrder()))
                        .map(detail -> new TaxBracket(detail.getMaxIncome(), detail.getRate()))
                        .collect(Collectors.toList());
                }
            }
        } catch (Exception e) {
            // Log error but continue - fall back to enum
            System.err.println("Error loading tax brackets from database: " + e.getMessage());
        }
        
        // Fall back to enum hardcoded values
        return taxBracketType.getBrackets();
    }

    /**
     * Calculate insurance contributions (BHXH, BHYT, BHTN)
     */
    public InsuranceBreakdown calculateInsurance(SalaryCalculationInput input) {
        long insuranceBase = input.getInsuranceBase();
        
        // Calculate BHXH and BHYT based on insurance base
        long bhxh = Math.round(insuranceBase * input.getBhxhRate() / 100);
        long bhyt = Math.round(insuranceBase * input.getBhytRate() / 100);

        // Calculate BHTN with zone-based cap
        WageZone wageZone = input.getWageZone();
        long bhtnBase = Math.min(input.getGrossSalary(), wageZone.getInsuranceCap());
        long bhtn = Math.round(bhtnBase * input.getBhtnRate() / 100);

        long totalInsurance = bhxh + bhyt + bhtn;

        return new InsuranceBreakdown(bhxh, bhyt, bhtn, totalInsurance);
    }

    /**
     * Calculate complete salary with tax
     */
    public SalaryCalculationResult calculateSalary(SalaryCalculationInput input) {
        // Calculate insurance
        InsuranceBreakdown insuranceBreakdown = calculateInsurance(input);
        long totalInsurance = insuranceBreakdown.getTotalInsurance();
        long incomeAfterInsurance = input.getGrossSalary() - totalInsurance;

        // Calculate deductions
        long dependentDeduction = input.getDependents() * input.getDependentDeductionPerPerson();
        long totalDeduction = input.getPersonalDeduction() + dependentDeduction;

        // Calculate taxable income (salary + bonus - deduction)
        long totalIncomeForTax = incomeAfterInsurance + input.getTetBonus();
        long taxableIncome = Math.max(totalIncomeForTax - totalDeduction, 0);

        // Calculate total tax
        long totalTax = calculateProgressiveTax(taxableIncome, input.getTaxBracketType());

        // Calculate salary-only tax (for breakdown)
        long salaryTaxableIncome = Math.max(incomeAfterInsurance - totalDeduction, 0);
        long salaryTax = calculateProgressiveTax(salaryTaxableIncome, input.getTaxBracketType());
        long bonusTax = Math.max(totalTax - salaryTax, 0);

        // Calculate final net amounts
        long netBeforeAllowance = input.getGrossSalary() - totalInsurance - salaryTax;
        long netMonthly = netBeforeAllowance + input.getTaxFreeAllowance() - input.getOtherDeduction();
        long netBonus = input.getTetBonus() - bonusTax;
        long totalNetSalary = netMonthly + netBonus;

        return new SalaryCalculationResult(
            input.getGrossSalary(),
            insuranceBreakdown.getBhxh(),
            insuranceBreakdown.getBhyt(),
            insuranceBreakdown.getBhtn(),
            totalInsurance,
            incomeAfterInsurance,
            input.getTetBonus(),
            totalDeduction,
            taxableIncome,
            totalTax,
            salaryTax,
            bonusTax,
            netBeforeAllowance,
            input.getTaxFreeAllowance(),
            input.getOtherDeduction(),
            netMonthly,
            netBonus,
            totalNetSalary
        );
    }
}
