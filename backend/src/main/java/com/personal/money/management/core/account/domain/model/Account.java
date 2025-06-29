package com.personal.money.management.core.account.domain.model;

import java.math.BigDecimal;

public class Account {
    private final Long id;
    private BigDecimal initBalance;
    private String accountName;
    private AccountType type;
    private String currency;
    private String description;

    public Account(String accountName, BigDecimal initBalance, AccountType type, String currency, String description) {
        this.id = null; // New entity
        this.accountName = accountName;
        this.initBalance = initBalance;
        this.type = type;
        this.currency = currency;
        this.description = description;
    }

    private Account(Long id, String accountName, BigDecimal initBalance, AccountType type, String currency, String description) {
        this.id = id;
        this.accountName = accountName;
        this.initBalance = initBalance;
        this.type = type;
        this.currency = currency;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getInitBalance() {
        return initBalance;
    }

    public void setInitBalance(BigDecimal initBalance) {
        this.initBalance = initBalance;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public AccountType getType() {
        return type;
    }

    public void setType(AccountType type) {
        this.type = type;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void update(String accountName, BigDecimal initBalance, AccountType type, String currency, String description) {
        this.accountName = accountName;
        this.initBalance = initBalance;
        this.type = type;
        this.currency = currency;
        this.description = description;
    }

    public static Account reconstruct(Long id, String accountName, BigDecimal initBalance, AccountType type, String currency, String description) {
        return new Account(id, accountName, initBalance, type, currency, description);
    }

    // equals, hashCode, toString omitted for brevity
}
