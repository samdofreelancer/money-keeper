package com.personal.money.management.core.tax.domain.model;

/**
 * Value Object representing the result of salary tax calculation
 */
public class SalaryCalculationResult {
    private final long grossSalary;
    private final long bhxh;
    private final long bhyt;
    private final long bhtn;
    private final long totalInsurance;
    private final long incomeAfterInsurance;
    private final long tetBonus;
    private final long totalDeduction;
    private final long taxableIncome;
    private final long totalTax;
    private final long salaryTax;
    private final long bonusTax;
    private final long netBeforeAllowance;
    private final long taxFreeAllowance;
    private final long otherDeduction;
    private final long netMonthly;
    private final long netBonus;
    private final long totalNetSalary;

    public SalaryCalculationResult(long grossSalary, long bhxh, long bhyt, long bhtn,
                                  long totalInsurance, long incomeAfterInsurance,
                                  long tetBonus, long totalDeduction, long taxableIncome,
                                  long totalTax, long salaryTax, long bonusTax,
                                  long netBeforeAllowance, long taxFreeAllowance,
                                  long otherDeduction, long netMonthly, long netBonus,
                                  long totalNetSalary) {
        this.grossSalary = grossSalary;
        this.bhxh = bhxh;
        this.bhyt = bhyt;
        this.bhtn = bhtn;
        this.totalInsurance = totalInsurance;
        this.incomeAfterInsurance = incomeAfterInsurance;
        this.tetBonus = tetBonus;
        this.totalDeduction = totalDeduction;
        this.taxableIncome = taxableIncome;
        this.totalTax = totalTax;
        this.salaryTax = salaryTax;
        this.bonusTax = bonusTax;
        this.netBeforeAllowance = netBeforeAllowance;
        this.taxFreeAllowance = taxFreeAllowance;
        this.otherDeduction = otherDeduction;
        this.netMonthly = netMonthly;
        this.netBonus = netBonus;
        this.totalNetSalary = totalNetSalary;
    }

    public long getGrossSalary() { return grossSalary; }
    public long getBhxh() { return bhxh; }
    public long getBhyt() { return bhyt; }
    public long getBhtn() { return bhtn; }
    public long getTotalInsurance() { return totalInsurance; }
    public long getIncomeAfterInsurance() { return incomeAfterInsurance; }
    public long getTetBonus() { return tetBonus; }
    public long getTotalDeduction() { return totalDeduction; }
    public long getTaxableIncome() { return taxableIncome; }
    public long getTotalTax() { return totalTax; }
    public long getSalaryTax() { return salaryTax; }
    public long getBonusTax() { return bonusTax; }
    public long getNetBeforeAllowance() { return netBeforeAllowance; }
    public long getTaxFreeAllowance() { return taxFreeAllowance; }
    public long getOtherDeduction() { return otherDeduction; }
    public long getNetMonthly() { return netMonthly; }
    public long getNetBonus() { return netBonus; }
    public long getTotalNetSalary() { return totalNetSalary; }
}
