package com.personal.money.management.core.exchange.infrastructure.persistence;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "exchange_rate", 
    indexes = {
        @Index(name = "idx_exchange_rate_base_date", columnList = "base,rate_date"),
        @Index(name = "idx_exchange_rate_date", columnList = "rate_date")
    })
public class ExchangeRateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "base", nullable = false, length = 10)
    private String base;

    @Column(name = "symbol", nullable = false, length = 10)
    private String symbol;

    @Column(name = "rate", nullable = false)
    private Double rate;

    @Column(name = "rate_date", nullable = false)
    private LocalDate rateDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBase() { return base; }
    public void setBase(String base) { this.base = base; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public Double getRate() { return rate; }
    public void setRate(Double rate) { this.rate = rate; }
    public LocalDate getRateDate() { return rateDate; }
    public void setRateDate(LocalDate rateDate) { this.rateDate = rateDate; }
} 