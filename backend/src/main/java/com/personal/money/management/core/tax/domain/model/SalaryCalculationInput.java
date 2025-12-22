package com.personal.money.management.core.tax.domain.model;

/**
 * Value Object representing input for salary tax calculation
 */
public class SalaryCalculationInput {
    private final long grossSalary;
    private final long tetBonus;
    private final long insuranceBase;
    private final int dependents;
    private final double bhxhRate;
    private final double bhytRate;
    private final double bhtnRate;
    private final long personalDeduction;
    private final long dependentDeductionPerPerson;
    private final long taxFreeAllowance;
    private final long otherDeduction;
    private final TaxBracketType taxBracketType;
    private final WageZone wageZone;

    public SalaryCalculationInput(long grossSalary, long tetBonus, long insuranceBase, 
                                 int dependents, double bhxhRate, double bhytRate, 
                                 double bhtnRate, long personalDeduction, 
                                 long dependentDeductionPerPerson, long taxFreeAllowance,
                                 long otherDeduction, TaxBracketType taxBracketType, 
                                 WageZone wageZone) {
        this.grossSalary = grossSalary;
        this.tetBonus = tetBonus;
        this.insuranceBase = insuranceBase;
        this.dependents = dependents;
        this.bhxhRate = bhxhRate;
        this.bhytRate = bhytRate;
        this.bhtnRate = bhtnRate;
        this.personalDeduction = personalDeduction;
        this.dependentDeductionPerPerson = dependentDeductionPerPerson;
        this.taxFreeAllowance = taxFreeAllowance;
        this.otherDeduction = otherDeduction;
        this.taxBracketType = taxBracketType;
        this.wageZone = wageZone;
    }

    public long getGrossSalary() { return grossSalary; }
    public long getTetBonus() { return tetBonus; }
    public long getInsuranceBase() { return insuranceBase; }
    public int getDependents() { return dependents; }
    public double getBhxhRate() { return bhxhRate; }
    public double getBhytRate() { return bhytRate; }
    public double getBhtnRate() { return bhtnRate; }
    public long getPersonalDeduction() { return personalDeduction; }
    public long getDependentDeductionPerPerson() { return dependentDeductionPerPerson; }
    public long getTaxFreeAllowance() { return taxFreeAllowance; }
    public long getOtherDeduction() { return otherDeduction; }
    public TaxBracketType getTaxBracketType() { return taxBracketType; }
    public WageZone getWageZone() { return wageZone; }
}
