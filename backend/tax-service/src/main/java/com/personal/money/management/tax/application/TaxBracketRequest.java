package com.personal.money.management.tax.application;

import java.time.LocalDate;
import java.util.List;

/**
 * Request DTO for creating or updating tax bracket configuration
 */
public class TaxBracketRequest {
    
    private String value;                    // e.g., "7-bracket" or "5-bracket"
    private String label;                    // e.g., "7 bậc (13/12/2025 - 30/6/2026)"
    private LocalDate effectiveDate;         // When this bracket becomes effective
    private List<TaxBracketDetailRequest> details;  // Progressive tax details
    
    // Constructors
    public TaxBracketRequest() {}
    
    public TaxBracketRequest(String value, String label, LocalDate effectiveDate, List<TaxBracketDetailRequest> details) {
        this.value = value;
        this.label = label;
        this.effectiveDate = effectiveDate;
        this.details = details;
    }
    
    // Getters and Setters
    public String getValue() {
        return value;
    }
    
    public void setValue(String value) {
        this.value = value;
    }
    
    public String getLabel() {
        return label;
    }
    
    public void setLabel(String label) {
        this.label = label;
    }
    
    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }
    
    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }
    
    public List<TaxBracketDetailRequest> getDetails() {
        return details;
    }
    
    public void setDetails(List<TaxBracketDetailRequest> details) {
        this.details = details;
    }
    
    /**
     * DTO for tax bracket detail (individual bracket in the bracket set)
     */
    public static class TaxBracketDetailRequest {
        private Long minIncome;        // Minimum income for this bracket
        private Long maxIncome;        // Maximum income for this bracket (threshold)
        private Double rate;           // Tax rate (0.05 = 5%)
        private Long deduction;        // Deduction amount (usually 0)
        private Integer bracketOrder;  // Order in the bracket list (1, 2, 3, ...)
        
        // Constructors
        public TaxBracketDetailRequest() {}
        
        public TaxBracketDetailRequest(Long minIncome, Long maxIncome, Double rate, Long deduction, Integer bracketOrder) {
            this.minIncome = minIncome;
            this.maxIncome = maxIncome;
            this.rate = rate;
            this.deduction = deduction;
            this.bracketOrder = bracketOrder;
        }
        
        // Getters and Setters
        public Long getMinIncome() {
            return minIncome;
        }
        
        public void setMinIncome(Long minIncome) {
            this.minIncome = minIncome;
        }
        
        public Long getMaxIncome() {
            return maxIncome;
        }
        
        public void setMaxIncome(Long maxIncome) {
            this.maxIncome = maxIncome;
        }
        
        public Double getRate() {
            return rate;
        }
        
        public void setRate(Double rate) {
            this.rate = rate;
        }
        
        public Long getDeduction() {
            return deduction;
        }
        
        public void setDeduction(Long deduction) {
            this.deduction = deduction;
        }
        
        public Integer getBracketOrder() {
            return bracketOrder;
        }
        
        public void setBracketOrder(Integer bracketOrder) {
            this.bracketOrder = bracketOrder;
        }
    }
}
