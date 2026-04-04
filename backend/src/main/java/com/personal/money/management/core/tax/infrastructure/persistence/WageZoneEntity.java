package com.personal.money.management.core.tax.infrastructure.persistence;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA Entity for WAGE_ZONE table
 * Infrastructure Layer - Persistence Model
 * Represents wage zones with minimum wage and BHTN insurance ceiling
 */
@Entity
@Table(name = "WAGE_ZONE", schema = "CORE")
public class WageZoneEntity {
    
    @Id
    private String id;
    
    @Column(name = "ZONE_VALUE", nullable = false, unique = true)
    private String value;
    
    @Column(name = "LABEL", nullable = false)
    private String label;
    
    @Column(name = "MINIMUM_WAGE", nullable = false)
    private Long minimumWage;
    
    @Column(name = "BHTN_INSURANCE_CAP", nullable = false)
    private Long insuranceCap;
    
    @Column(name = "EFFECTIVE_DATE", nullable = false)
    private LocalDate effectiveDate;
    
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;
    
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
    
    // Constructors
    public WageZoneEntity() {}
    
    public WageZoneEntity(String id, String value, String label, Long minimumWage, Long insuranceCap, LocalDate effectiveDate) {
        this.id = id;
        this.value = value;
        this.label = label;
        this.minimumWage = minimumWage;
        this.insuranceCap = insuranceCap;
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
    
    public Long getMinimumWage() {
        return minimumWage;
    }
    
    public void setMinimumWage(Long minimumWage) {
        this.minimumWage = minimumWage;
    }
    
    public Long getInsuranceCap() {
        return insuranceCap;
    }
    
    public void setInsuranceCap(Long insuranceCap) {
        this.insuranceCap = insuranceCap;
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
