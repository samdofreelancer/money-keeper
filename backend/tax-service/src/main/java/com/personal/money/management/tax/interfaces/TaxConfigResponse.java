package com.personal.money.management.tax.interfaces;

import java.util.List;

/**
 * DTO for Tax Configuration Response
 * Contains all tax-related configurations needed by the frontend
 */
public class TaxConfigResponse {
    
    private List<TaxBracketOption> taxBrackets;
    private List<DeductionBracketOption> deductionBrackets;
    private List<WageZoneOption> wageZones;
    
    public TaxConfigResponse(
            List<TaxBracketOption> taxBrackets,
            List<DeductionBracketOption> deductionBrackets,
            List<WageZoneOption> wageZones) {
        this.taxBrackets = taxBrackets;
        this.deductionBrackets = deductionBrackets;
        this.wageZones = wageZones;
    }
    
    public List<TaxBracketOption> getTaxBrackets() {
        return taxBrackets;
    }
    
    public void setTaxBrackets(List<TaxBracketOption> taxBrackets) {
        this.taxBrackets = taxBrackets;
    }
    
    public List<DeductionBracketOption> getDeductionBrackets() {
        return deductionBrackets;
    }
    
    public void setDeductionBrackets(List<DeductionBracketOption> deductionBrackets) {
        this.deductionBrackets = deductionBrackets;
    }
    
    public List<WageZoneOption> getWageZones() {
        return wageZones;
    }
    
    public void setWageZones(List<WageZoneOption> wageZones) {
        this.wageZones = wageZones;
    }
    
    // Inner classes for tax configuration options
    
    public static class TaxBracketDetail {
        private String id;
        private long minIncome;
        private Long maxIncome;
        private double rate;
        private long deduction;
        private int order;
        
        public TaxBracketDetail() {}
        
        public TaxBracketDetail(long minIncome, Long maxIncome, double rate, long deduction, int order) {
            this.minIncome = minIncome;
            this.maxIncome = maxIncome;
            this.rate = rate;
            this.deduction = deduction;
            this.order = order;
        }
        
        public String getId() {
            return id;
        }
        
        public void setId(String id) {
            this.id = id;
        }
        
        public long getMinIncome() {
            return minIncome;
        }
        
        public void setMinIncome(long minIncome) {
            this.minIncome = minIncome;
        }
        
        public Long getMaxIncome() {
            return maxIncome;
        }
        
        public void setMaxIncome(Long maxIncome) {
            this.maxIncome = maxIncome;
        }
        
        public double getRate() {
            return rate;
        }
        
        public void setRate(double rate) {
            this.rate = rate;
        }
        
        public long getDeduction() {
            return deduction;
        }
        
        public void setDeduction(long deduction) {
            this.deduction = deduction;
        }
        
        public int getOrder() {
            return order;
        }
        
        public void setOrder(int order) {
            this.order = order;
        }
    }
    
    public static class TaxBracketOption {
        private String value;
        private String label;
        private String effectiveDate;
        private List<TaxBracketDetail> brackets;
        
        public TaxBracketOption(String value, String label, String effectiveDate) {
            this.value = value;
            this.label = label;
            this.effectiveDate = effectiveDate;
            this.brackets = new java.util.ArrayList<>();
        }
        
        public TaxBracketOption(String value, String label, String effectiveDate, List<TaxBracketDetail> brackets) {
            this.value = value;
            this.label = label;
            this.effectiveDate = effectiveDate;
            this.brackets = brackets;
        }
        
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
        
        public String getEffectiveDate() {
            return effectiveDate;
        }
        
        public void setEffectiveDate(String effectiveDate) {
            this.effectiveDate = effectiveDate;
        }
        
        public List<TaxBracketDetail> getBrackets() {
            return brackets;
        }
        
        public void setBrackets(List<TaxBracketDetail> brackets) {
            this.brackets = brackets;
        }
    }
    
    public static class DeductionBracketOption {
        private String value;
        private String label;
        private long personalDeduction;
        private long dependentDeduction;
        private String effectiveDate;
        
        public DeductionBracketOption(
                String value,
                String label,
                long personalDeduction,
                long dependentDeduction,
                String effectiveDate) {
            this.value = value;
            this.label = label;
            this.personalDeduction = personalDeduction;
            this.dependentDeduction = dependentDeduction;
            this.effectiveDate = effectiveDate;
        }
        
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
        
        public long getPersonalDeduction() {
            return personalDeduction;
        }
        
        public void setPersonalDeduction(long personalDeduction) {
            this.personalDeduction = personalDeduction;
        }
        
        public long getDependentDeduction() {
            return dependentDeduction;
        }
        
        public void setDependentDeduction(long dependentDeduction) {
            this.dependentDeduction = dependentDeduction;
        }
        
        public String getEffectiveDate() {
            return effectiveDate;
        }
        
        public void setEffectiveDate(String effectiveDate) {
            this.effectiveDate = effectiveDate;
        }
    }
    
    public static class WageZoneOption {
        private String value;
        private String label;
        private long minimumWage;
        private long bhtnCeiling;
        
        public WageZoneOption(String value, String label, long minimumWage, long bhtnCeiling) {
            this.value = value;
            this.label = label;
            this.minimumWage = minimumWage;
            this.bhtnCeiling = bhtnCeiling;
        }
        
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
        
        public long getMinimumWage() {
            return minimumWage;
        }
        
        public void setMinimumWage(long minimumWage) {
            this.minimumWage = minimumWage;
        }
        
        public long getBhtnCeiling() {
            return bhtnCeiling;
        }
        
        public void setBhtnCeiling(long bhtnCeiling) {
            this.bhtnCeiling = bhtnCeiling;
        }
    }
}
