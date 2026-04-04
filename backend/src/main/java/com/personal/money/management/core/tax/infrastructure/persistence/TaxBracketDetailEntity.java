package com.personal.money.management.core.tax.infrastructure.persistence;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA Entity for TAX_BRACKET_DETAIL table
 * Infrastructure Layer - Persistence Model
 * Represents progressive tax rates for a specific tax bracket
 */
@Entity
@Table(name = "TAX_BRACKET_DETAIL", schema = "CORE")
public class TaxBracketDetailEntity {
    
    @Id
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BRACKET_ID", nullable = false)
    private TaxBracketEntity bracket;
    
    @Column(name = "MIN_INCOME", nullable = false)
    private Long minIncome;
    
    @Column(name = "MAX_INCOME")
    private Long maxIncome;
    
    @Column(name = "TAX_RATE", nullable = false)
    private Double rate;
    
    @Column(name = "DEDUCTION", nullable = false)
    private Long deduction;
    
    @Column(name = "BRACKET_SEQ", nullable = false)
    private Integer bracketOrder;
    
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;
    
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
    
    // Constructors
    public TaxBracketDetailEntity() {}
    
    public TaxBracketDetailEntity(String id, TaxBracketEntity bracket, Long minIncome, Long maxIncome, Double rate, Long deduction, Integer bracketOrder) {
        this.id = id;
        this.bracket = bracket;
        this.minIncome = minIncome;
        this.maxIncome = maxIncome;
        this.rate = rate;
        this.deduction = deduction;
        this.bracketOrder = bracketOrder;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public TaxBracketEntity getBracket() {
        return bracket;
    }
    
    public void setBracket(TaxBracketEntity bracket) {
        this.bracket = bracket;
    }
    
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
