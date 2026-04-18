package com.personal.money.management.core.account.domain.model;

import com.personal.money.management.core.shared.domain.valueobject.AccountName;
import com.personal.money.management.core.shared.domain.valueobject.Money;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class Account {
    private final Long id;

    @NotNull(message = "Account name must not be null")
    private final AccountName name;

    @NotNull(message = "Initial balance must not be null")
    private final Money initialBalance;

    @NotNull(message = "Account type must not be null")
    private final AccountType type;

    private final String description;

    private final boolean active;

    public Account(AccountName name, Money initialBalance, AccountType type, String description) {
        this.id = null; // New entity
        this.name = name;
        this.initialBalance = initialBalance;
        this.type = type;
        this.description = description;
        this.active = true; // Always active on creation
    }

    private Account(Long id, AccountName name, Money initialBalance, AccountType type, String description, boolean active) {
        this.id = id;
        this.name = name;
        this.initialBalance = initialBalance;
        this.type = type;
        this.description = description;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public Money getInitialBalance() {
        return initialBalance;
    }

    public AccountName getName() {
        return name;
    }

    public AccountType getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return active;
    }

    public static Account reconstruct(Long id, AccountName name, Money initialBalance, AccountType type, String description, boolean active) {
        return new Account(id, name, initialBalance, type, description, active);
    }
}
