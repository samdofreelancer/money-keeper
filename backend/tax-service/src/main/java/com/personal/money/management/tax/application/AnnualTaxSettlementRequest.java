package com.personal.money.management.tax.application;

/**
 * DTO for Annual Tax Settlement Request
 */
public class AnnualTaxSettlementRequest {
    
    private String year;                        // Năm quyết toán
    private long totalGrossSalary;             // Tổng lương gross trong năm
    private long totalBonus;                    // Tổng thưởng trong năm
    private long personalDeduction;            // Khấu trừ bản thân
    private long dependentDeduction;           // Khấu trừ 1 người phụ thuộc
    private int numberOfDependents;            // Số người phụ thuộc
    private long taxFreeAllowance;             // Phụ cấp không chịu thuế
    private long otherDeduction;               // Khấu trừ khác
    private long bhxhContribution;             // Đóng BHXH
    private long bhytContribution;             // Đóng BHYT
    private long bhtnContribution;             // Đóng BHTN
    private long taxAlreadyPaid;               // Thuế đã nộp trong năm
    
    // Constructors
    public AnnualTaxSettlementRequest() {
    }
    
    public AnnualTaxSettlementRequest(
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
    
    // Getters and Setters
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    
    public long getTotalGrossSalary() { return totalGrossSalary; }
    public void setTotalGrossSalary(long totalGrossSalary) { this.totalGrossSalary = totalGrossSalary; }
    
    public long getTotalBonus() { return totalBonus; }
    public void setTotalBonus(long totalBonus) { this.totalBonus = totalBonus; }
    
    public long getPersonalDeduction() { return personalDeduction; }
    public void setPersonalDeduction(long personalDeduction) { this.personalDeduction = personalDeduction; }
    
    public long getDependentDeduction() { return dependentDeduction; }
    public void setDependentDeduction(long dependentDeduction) { this.dependentDeduction = dependentDeduction; }
    
    public int getNumberOfDependents() { return numberOfDependents; }
    public void setNumberOfDependents(int numberOfDependents) { this.numberOfDependents = numberOfDependents; }
    
    public long getTaxFreeAllowance() { return taxFreeAllowance; }
    public void setTaxFreeAllowance(long taxFreeAllowance) { this.taxFreeAllowance = taxFreeAllowance; }
    
    public long getOtherDeduction() { return otherDeduction; }
    public void setOtherDeduction(long otherDeduction) { this.otherDeduction = otherDeduction; }
    
    public long getBhxhContribution() { return bhxhContribution; }
    public void setBhxhContribution(long bhxhContribution) { this.bhxhContribution = bhxhContribution; }
    
    public long getBhytContribution() { return bhytContribution; }
    public void setBhytContribution(long bhytContribution) { this.bhytContribution = bhytContribution; }
    
    public long getBhtnContribution() { return bhtnContribution; }
    public void setBhtnContribution(long bhtnContribution) { this.bhtnContribution = bhtnContribution; }
    
    public long getTaxAlreadyPaid() { return taxAlreadyPaid; }
    public void setTaxAlreadyPaid(long taxAlreadyPaid) { this.taxAlreadyPaid = taxAlreadyPaid; }
}
