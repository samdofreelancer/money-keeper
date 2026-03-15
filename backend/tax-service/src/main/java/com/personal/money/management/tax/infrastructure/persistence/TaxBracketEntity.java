package com.personal.money.management.tax.infrastructure.persistence;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA Entity for TAX_BRACKET table
 * Infrastructure Layer - Persistence Model
 * Represents a tax bracket configuration with its progressive tax rates
 */
@Entity
@Table(name = "TAX_BRACKET")
public class TaxBracketEntity {
    
    @Id
    private String id;
    
    @Column(name = "BRACKET_VALUE", nullable = false, unique = true)
    private String value;
    
    @Column(name = "LABEL", nullable = false)
    private String label;
    
    @Column(name = "EFFECTIVE_DATE", nullable = false)
    private LocalDate effectiveDate;
    
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;
    
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "bracket", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @OrderBy("bracketOrder ASC")
    private java.util.List<TaxBracketDetailEntity> details;
    
    // Constructors
    public TaxBracketEntity() {}
    
    public TaxBracketEntity(String id, String value, String label, LocalDate effectiveDate) {
        this.id = id;
        this.value = value;
        this.label = label;
        this.effectiveDate = effectiveDate;
        this.details = new java.util.ArrayList<>();
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
    
    public java.util.List<TaxBracketDetailEntity> getDetails() {
        return details;
    }
    
    public void setDetails(java.util.List<TaxBracketDetailEntity> details) {
        this.details = details;
    }
}
