package com.personal.money.management.core.account.domain.model;

import java.math.BigDecimal;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import lombok.Data;

@Data
public class Account {
    private final Long id;

    @NotBlank(message = "Account name must not be blank")
    private final String accountName;

    @NotNull(message = "Initial balance must not be null")
    @Positive(message = "Initial balance must be positive")
    private final BigDecimal initBalance;

    @NotNull(message = "Account type must not be null")
    private final AccountType type;

    @NotBlank(message = "Currency must not be blank")
    private final String currency;

    private final String description;

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

    public String getAccountName() {
        return accountName;
    }

    public AccountType getType() {
        return type;
    }

    public String getCurrency() {
        return currency;
    }

    public String getDescription() {
        return description;
    }

    public static Account reconstruct(Long id, String accountName, BigDecimal initBalance, AccountType type, String currency, String description) {
        return new Account(id, accountName, initBalance, type, currency, description);
    }
}
