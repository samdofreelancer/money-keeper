package com.personal.money.management.core.account.interfaces.api.dto;

import com.personal.money.management.core.account.domain.model.AccountType;

import javax.validation.constraints.*;
import java.math.BigDecimal;

public class AccountRequest {
    @NotBlank(message = "Account name is required")
    @Size(max = 255, message = "Account name must be at most 255 characters")
    private String accountName;

    @NotNull(message = "Initial balance is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Initial balance must be non-negative")
    private BigDecimal initBalance;

    @NotNull(message = "Account type is required")
    private AccountType type;

    @NotBlank(message = "Currency is required")
    @Size(max = 10, message = "Currency must be at most 10 characters")
    private String currency;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

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
