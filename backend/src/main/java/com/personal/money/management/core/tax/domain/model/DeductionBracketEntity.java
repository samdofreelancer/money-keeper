package com.personal.money.management.core.tax.domain.model;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA Entity for DEDUCTION_BRACKET table
 * Represents personal and dependent deduction amounts for different periods
 */
@Entity
@Table(name = "DEDUCTION_BRACKET", schema = "CORE")
public class DeductionBracketEntity {
    
    @Id
    private String id;
    
    @Column(name = "BRACKET_VALUE", nullable = false, unique = true)
    private String value;
    
    @Column(name = "LABEL", nullable = false)
    private String label;
    
    @Column(name = "PERSONAL_DEDUCTION", nullable = false)
    private Long personalDeduction;
    
    @Column(name = "DEPENDENT_DEDUCTION", nullable = false)
    private Long dependentDeduction;
    
    @Column(name = "EFFECTIVE_DATE", nullable = false)
    private LocalDate effectiveDate;
    
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;
    
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
    
    // Constructors
    public DeductionBracketEntity() {}
    
    public DeductionBracketEntity(String id, String value, String label, Long personalDeduction, Long dependentDeduction, LocalDate effectiveDate) {
        this.id = id;
        this.value = value;
        this.label = label;
        this.personalDeduction = personalDeduction;
        this.dependentDeduction = dependentDeduction;
        this.effectiveDate = effectiveDate;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
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
    
    public Long getPersonalDeduction() {
        return personalDeduction;
    }
    
    public void setPersonalDeduction(Long personalDeduction) {
        this.personalDeduction = personalDeduction;
    }
    
    public Long getDependentDeduction() {
        return dependentDeduction;
    }
    
    public void setDependentDeduction(Long dependentDeduction) {
        this.dependentDeduction = dependentDeduction;
    }
    
    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }
    
    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
