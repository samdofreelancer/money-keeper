package com.personal.money.management.core.tax.domain.model;

/**
 * Value object representing the result of annual tax settlement calculation
 */
public class AnnualTaxSettlementResult {
    
    private final String year;
    private final long totalIncome;                    // Tổng thu nhập = lương + thưởng
    private final long totalDeductions;                // Tổng khấu trừ (bản thân + phụ thuộc + khác)
    private final long taxableIncome;                  // Thu nhập chịu thuế = tổng - khấu trừ
    private final long calculatedTax;                  // Thuế tính toán
    private final long taxAlreadyPaid;                 // Thuế đã nộp
    private final long taxDue;                         // Thuế phải nộp (> 0) hoặc hoàn lại (< 0)
    private final String settlementStatus;             // "due" (phải nộp), "refund" (được hoàn), "balanced" (cân bằng)
    
    // Breakdown details
    private final long personalDeductionApplied;
    private final long dependentDeductionApplied;
    private final long otherDeductionApplied;
    private final long insuranceContributions;         // BHXH + BHYT + BHTN
    
    public AnnualTaxSettlementResult(
            String year,
            long totalIncome,
            long totalDeductions,
            long taxableIncome,
            long calculatedTax,
            long taxAlreadyPaid,
            long taxDue,
            String settlementStatus,
            long personalDeductionApplied,
            long dependentDeductionApplied,
            long otherDeductionApplied,
            long insuranceContributions) {
        this.year = year;
        this.totalIncome = totalIncome;
        this.totalDeductions = totalDeductions;
        this.taxableIncome = taxableIncome;
        this.calculatedTax = calculatedTax;
        this.taxAlreadyPaid = taxAlreadyPaid;
        this.taxDue = taxDue;
        this.settlementStatus = settlementStatus;
        this.personalDeductionApplied = personalDeductionApplied;
        this.dependentDeductionApplied = dependentDeductionApplied;
        this.otherDeductionApplied = otherDeductionApplied;
        this.insuranceContributions = insuranceContributions;
    }
    
    // Getters
    public String getYear() { return year; }
    public long getTotalIncome() { return totalIncome; }
    public long getTotalDeductions() { return totalDeductions; }
    public long getTaxableIncome() { return taxableIncome; }
    public long getCalculatedTax() { return calculatedTax; }
    public long getTaxAlreadyPaid() { return taxAlreadyPaid; }
    public long getTaxDue() { return taxDue; }
    public String getSettlementStatus() { return settlementStatus; }
    public long getPersonalDeductionApplied() { return personalDeductionApplied; }
    public long getDependentDeductionApplied() { return dependentDeductionApplied; }
    public long getOtherDeductionApplied() { return otherDeductionApplied; }
    public long getInsuranceContributions() { return insuranceContributions; }
}
