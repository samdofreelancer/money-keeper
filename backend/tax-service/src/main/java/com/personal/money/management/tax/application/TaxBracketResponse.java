package com.personal.money.management.tax.application;

/**
 * Response DTO for tax bracket operations
 */
public class TaxBracketResponse {
    
    private String value;
    private String label;
    private String effectiveDate;
    private String message;
    private boolean success;
    
    // Constructors
    public TaxBracketResponse() {}
    
    public TaxBracketResponse(String value, String label, String effectiveDate, String message, boolean success) {
        this.value = value;
        this.label = label;
        this.effectiveDate = effectiveDate;
        this.message = message;
        this.success = success;
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
    
    public String getEffectiveDate() {
        return effectiveDate;
    }
    
    public void setEffectiveDate(String effectiveDate) {
        this.effectiveDate = effectiveDate;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
}
