package com.personal.money.management.core.account.interfaces.api.dto;

import com.personal.money.management.core.account.domain.model.AccountType;

import java.math.BigDecimal;

public class AccountResponse {
    private Long id;
    private String accountName;
    private BigDecimal initBalance;
    private AccountType type;
    private String currency;
    private String description;

    public AccountResponse() {}

    public AccountResponse(Long id, String accountName, BigDecimal initBalance, AccountType type, String currency, String description) {
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

    public void setId(Long id) {
        this.id = id;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public BigDecimal getInitBalance() {
        return initBalance;
    }

    public void setInitBalance(BigDecimal initBalance) {
        this.initBalance = initBalance;
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
}
