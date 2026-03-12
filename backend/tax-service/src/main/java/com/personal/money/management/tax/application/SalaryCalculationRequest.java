package com.personal.money.management.tax.application;

/**
 * Request DTO for salary calculation
 */
public class SalaryCalculationRequest {
    private long grossSalary;
    private long tetBonus;
    private long insuranceBase;
    private int dependents;
    private double bhxhRate;
    private double bhytRate;
    private double bhtnRate;
    private long personalDeduction;
    private long dependentDeductionPerPerson;
    private long taxFreeAllowance;
    private long otherDeduction;
    private String taxBracketType;
    private String wageZone;

    // Constructors
    public SalaryCalculationRequest() {}

    public SalaryCalculationRequest(long grossSalary, long tetBonus, long insuranceBase,
                                   int dependents, double bhxhRate, double bhytRate,
                                   double bhtnRate, long personalDeduction,
                                   long dependentDeductionPerPerson, long taxFreeAllowance,
                                   long otherDeduction, String taxBracketType, String wageZone) {
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

    // Getters and Setters
    public long getGrossSalary() { return grossSalary; }
    public void setGrossSalary(long grossSalary) { this.grossSalary = grossSalary; }

    public long getTetBonus() { return tetBonus; }
    public void setTetBonus(long tetBonus) { this.tetBonus = tetBonus; }

    public long getInsuranceBase() { return insuranceBase; }
    public void setInsuranceBase(long insuranceBase) { this.insuranceBase = insuranceBase; }

    public int getDependents() { return dependents; }
    public void setDependents(int dependents) { this.dependents = dependents; }

    public double getBhxhRate() { return bhxhRate; }
    public void setBhxhRate(double bhxhRate) { this.bhxhRate = bhxhRate; }

    public double getBhytRate() { return bhytRate; }
    public void setBhytRate(double bhytRate) { this.bhytRate = bhytRate; }

    public double getBhtnRate() { return bhtnRate; }
    public void setBhtnRate(double bhtnRate) { this.bhtnRate = bhtnRate; }

    public long getPersonalDeduction() { return personalDeduction; }
    public void setPersonalDeduction(long personalDeduction) { this.personalDeduction = personalDeduction; }

    public long getDependentDeductionPerPerson() { return dependentDeductionPerPerson; }
    public void setDependentDeductionPerPerson(long dependentDeductionPerPerson) { 
        this.dependentDeductionPerPerson = dependentDeductionPerPerson; 
    }

    public long getTaxFreeAllowance() { return taxFreeAllowance; }
    public void setTaxFreeAllowance(long taxFreeAllowance) { this.taxFreeAllowance = taxFreeAllowance; }

    public long getOtherDeduction() { return otherDeduction; }
    public void setOtherDeduction(long otherDeduction) { this.otherDeduction = otherDeduction; }

    public String getTaxBracketType() { return taxBracketType; }
    public void setTaxBracketType(String taxBracketType) { this.taxBracketType = taxBracketType; }

    public String getWageZone() { return wageZone; }
    public void setWageZone(String wageZone) { this.wageZone = wageZone; }
}
