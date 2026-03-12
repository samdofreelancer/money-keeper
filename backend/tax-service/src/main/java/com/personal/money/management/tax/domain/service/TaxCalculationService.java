package com.personal.money.management.tax.domain.service;

import com.personal.money.management.tax.domain.model.TaxBracket;
import com.personal.money.management.tax.domain.model.DeductionBracketValue;
import com.personal.money.management.tax.domain.model.WageZoneValue;
import com.personal.money.management.tax.domain.model.TaxBracketType;
import com.personal.money.management.tax.domain.model.SalaryCalculationInput;
import com.personal.money.management.tax.domain.model.SalaryCalculationResult;
import com.personal.money.management.tax.infrastructure.persistence.TaxBracketEntity;
import com.personal.money.management.tax.infrastructure.persistence.DeductionBracketEntity;
import com.personal.money.management.tax.infrastructure.persistence.WageZoneEntity;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Domain Service for tax calculations following Vietnam's personal income tax rules
 * This service contains the core business logic for tax calculation
 * 
 * All tax bracket data is loaded from database for flexibility
 * No hardcoded values - fully database-driven
 */
public class TaxCalculationService {
    
    private final TaxBracketRepository taxBracketRepository;
    private final DeductionBracketRepository deductionBracketRepository;
    private final WageZoneRepository wageZoneRepository;
    
    public TaxCalculationService(TaxBracketRepository taxBracketRepository,
                                 DeductionBracketRepository deductionBracketRepository,
                                 WageZoneRepository wageZoneRepository) {
        this.taxBracketRepository = taxBracketRepository;
        this.deductionBracketRepository = deductionBracketRepository;
        this.wageZoneRepository = wageZoneRepository;
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

        // Get brackets from database
        List<TaxBracket> brackets = getTaxBracketsFromDatabase(taxBracketType);
        
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
     * 
     * @param taxBracketType The tax bracket type enum
     * @return List of TaxBracket objects ordered by bracket order
     */
    private List<TaxBracket> getTaxBracketsFromDatabase(TaxBracketType taxBracketType) {
        String bracketValue = taxBracketType.getCode();  // e.g., "7-bracket" or "5-bracket"
        var entityOptional = taxBracketRepository.findByValue(bracketValue);
        
        if (entityOptional.isEmpty()) {
            throw new IllegalArgumentException("Tax bracket not found for value: " + bracketValue);
        }
        
        TaxBracketEntity entity = entityOptional.get();
        if (entity.getDetails() == null || entity.getDetails().isEmpty()) {
            throw new IllegalArgumentException("No tax bracket details found for value: " + bracketValue);
        }
        
        // Convert database entities to domain TaxBracket objects
        return entity.getDetails().stream()
            .sorted((a, b) -> a.getBracketOrder().compareTo(b.getBracketOrder()))
            .map(detail -> new TaxBracket(
                detail.getMaxIncome() != null ? detail.getMaxIncome() : Long.MAX_VALUE, 
                detail.getRate() / 100.0  // Convert percentage (5) to decimal (0.05)
            ))
            .collect(Collectors.toList());
    }
    
    /**
     * Get deduction bracket from database
     * @param date The date to find the effective deduction bracket for
     * @return DeductionBracketValue or null if not found
     */
    public DeductionBracketValue getDeductionBracket(LocalDate date) {
        var entities = deductionBracketRepository.findLatestEffectiveByDate(date);
        
        if (entities.isEmpty()) {
            throw new IllegalArgumentException("No deduction bracket found for date: " + date);
        }
        
        DeductionBracketEntity entity = entities.get(0);
        return new DeductionBracketValue(
            entity.getValue(),
            entity.getLabel(),
            entity.getPersonalDeduction(),
            entity.getDependentDeduction(),
            entity.getEffectiveDate()
        );
    }
    
    /**
     * Get wage zone from database
     * @param wageZoneValue The wage zone code
     * @return WageZoneValue or null if not found
     */
    public WageZoneValue getWageZone(String wageZoneValue) {
        var entityOptional = wageZoneRepository.findByValue(wageZoneValue);
        
        if (entityOptional.isEmpty()) {
            throw new IllegalArgumentException("Wage zone not found for value: " + wageZoneValue);
        }
        
        WageZoneEntity entity = entityOptional.get();
        return new WageZoneValue(
            entity.getValue(),
            entity.getLabel(),
            entity.getMinimumWage(),
            entity.getInsuranceCap()
        );
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
        WageZoneValue wageZone = input.getWageZone();
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
