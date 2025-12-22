package com.personal.money.management.core.tax.interfaces;

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
    
    public static class TaxBracketOption {
        private String value;
        private String label;
        private String effectiveDate;
        
        public TaxBracketOption(String value, String label, String effectiveDate) {
            this.value = value;
            this.label = label;
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
        
        public String getEffectiveDate() {
            return effectiveDate;
        }
        
        public void setEffectiveDate(String effectiveDate) {
            this.effectiveDate = effectiveDate;
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
