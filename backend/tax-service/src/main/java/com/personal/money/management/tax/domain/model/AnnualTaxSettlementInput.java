package com.personal.money.management.tax.domain.model;

import java.time.LocalDate;

/**
 * Value object for Annual Tax Settlement Input
 * Contains all information needed to calculate annual tax liability
 */
public class AnnualTaxSettlementInput {
    
    private final String year;                          // Năm quyết toán (e.g., "2025")
    private final long totalGrossSalary;               // Tổng lương gross trong năm
    private final long totalBonus;                      // Tổng thưởng trong năm
    private final long personalDeduction;              // Khấu trừ bản thân
    private final long dependentDeduction;             // Khấu trừ người phụ thuộc
    private final int numberOfDependents;              // Số người phụ thuộc
    private final long taxFreeAllowance;               // Phụ cấp không chịu thuế
    private final long otherDeduction;                 // Khấu trừ khác
    private final long bhxhContribution;               // Đóng BHXH
    private final long bhytContribution;               // Đóng BHYT
    private final long bhtnContribution;               // Đóng BHTN
    private final long taxAlreadyPaid;                 // Thuế đã nộp trong năm
    
    public AnnualTaxSettlementInput(
            String year,
            long totalGrossSalary,
            long totalBonus,
            long personalDeduction,
            long dependentDeduction,
            int numberOfDependents,
            long taxFreeAllowance,
            long otherDeduction,
            long bhxhContribution,
            long bhytContribution,
            long bhtnContribution,
            long taxAlreadyPaid) {
        this.year = year;
        this.totalGrossSalary = totalGrossSalary;
        this.totalBonus = totalBonus;
        this.personalDeduction = personalDeduction;
        this.dependentDeduction = dependentDeduction;
        this.numberOfDependents = numberOfDependents;
        this.taxFreeAllowance = taxFreeAllowance;
        this.otherDeduction = otherDeduction;
        this.bhxhContribution = bhxhContribution;
        this.bhytContribution = bhytContribution;
        this.bhtnContribution = bhtnContribution;
        this.taxAlreadyPaid = taxAlreadyPaid;
    }
    
    // Getters
    public String getYear() { return year; }
    public long getTotalGrossSalary() { return totalGrossSalary; }
    public long getTotalBonus() { return totalBonus; }
    public long getPersonalDeduction() { return personalDeduction; }
    public long getDependentDeduction() { return dependentDeduction; }
    public int getNumberOfDependents() { return numberOfDependents; }
    public long getTaxFreeAllowance() { return taxFreeAllowance; }
    public long getOtherDeduction() { return otherDeduction; }
    public long getBhxhContribution() { return bhxhContribution; }
    public long getBhytContribution() { return bhytContribution; }
    public long getBhtnContribution() { return bhtnContribution; }
    public long getTaxAlreadyPaid() { return taxAlreadyPaid; }
}
