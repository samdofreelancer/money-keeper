package com.personal.money.management.core.tax.application;

/**
 * Response DTO for salary calculation
 */
public class SalaryCalculationResponse {
    private long grossSalary;
    private long bhxh;
    private long bhyt;
    private long bhtn;
    private long totalInsurance;
    private long incomeAfterInsurance;
    private long tetBonus;
    private long totalDeduction;
    private long taxableIncome;
    private long totalTax;
    private long salaryTax;
    private long bonusTax;
    private long netBeforeAllowance;
    private long taxFreeAllowance;
    private long otherDeduction;
    private long netMonthly;
    private long netBonus;
    private long totalNetSalary;

    public SalaryCalculationResponse() {}

    public SalaryCalculationResponse(long grossSalary, long bhxh, long bhyt, long bhtn,
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

    // Getters and Setters
    public long getGrossSalary() { return grossSalary; }
    public void setGrossSalary(long grossSalary) { this.grossSalary = grossSalary; }

    public long getBhxh() { return bhxh; }
    public void setBhxh(long bhxh) { this.bhxh = bhxh; }

    public long getBhyt() { return bhyt; }
    public void setBhyt(long bhyt) { this.bhyt = bhyt; }

    public long getBhtn() { return bhtn; }
    public void setBhtn(long bhtn) { this.bhtn = bhtn; }

    public long getTotalInsurance() { return totalInsurance; }
    public void setTotalInsurance(long totalInsurance) { this.totalInsurance = totalInsurance; }

    public long getIncomeAfterInsurance() { return incomeAfterInsurance; }
    public void setIncomeAfterInsurance(long incomeAfterInsurance) { this.incomeAfterInsurance = incomeAfterInsurance; }

    public long getTetBonus() { return tetBonus; }
    public void setTetBonus(long tetBonus) { this.tetBonus = tetBonus; }

    public long getTotalDeduction() { return totalDeduction; }
    public void setTotalDeduction(long totalDeduction) { this.totalDeduction = totalDeduction; }

    public long getTaxableIncome() { return taxableIncome; }
    public void setTaxableIncome(long taxableIncome) { this.taxableIncome = taxableIncome; }

    public long getTotalTax() { return totalTax; }
    public void setTotalTax(long totalTax) { this.totalTax = totalTax; }

    public long getSalaryTax() { return salaryTax; }
    public void setSalaryTax(long salaryTax) { this.salaryTax = salaryTax; }

    public long getBonusTax() { return bonusTax; }
    public void setBonusTax(long bonusTax) { this.bonusTax = bonusTax; }

    public long getNetBeforeAllowance() { return netBeforeAllowance; }
    public void setNetBeforeAllowance(long netBeforeAllowance) { this.netBeforeAllowance = netBeforeAllowance; }

    public long getTaxFreeAllowance() { return taxFreeAllowance; }
    public void setTaxFreeAllowance(long taxFreeAllowance) { this.taxFreeAllowance = taxFreeAllowance; }

    public long getOtherDeduction() { return otherDeduction; }
    public void setOtherDeduction(long otherDeduction) { this.otherDeduction = otherDeduction; }

    public long getNetMonthly() { return netMonthly; }
    public void setNetMonthly(long netMonthly) { this.netMonthly = netMonthly; }

    public long getNetBonus() { return netBonus; }
    public void setNetBonus(long netBonus) { this.netBonus = netBonus; }

    public long getTotalNetSalary() { return totalNetSalary; }
    public void setTotalNetSalary(long totalNetSalary) { this.totalNetSalary = totalNetSalary; }
}
