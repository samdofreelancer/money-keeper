package com.personal.money.management.core.shared.domain.valueobject;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * Value Object representing a monetary amount with currency.
 * 
 * This VO encapsulates a BigDecimal amount together with a CurrencyCode.
 * It's immutable and compared by value.
 * 
 * Money supports basic arithmetic operations: add, subtract, multiply, divide.
 * All operations return new Money instances (immutability).
 */
public class Money {
    private final BigDecimal amount;
    private final CurrencyCode currency;

    private Money(BigDecimal amount, CurrencyCode currency) {
        this.amount = amount;
        this.currency = currency;
    }

    /**
     * Create a Money instance from an amount and currency code.
     *
     * @param amount the monetary amount as BigDecimal
     * @param currencyCode the currency code (e.g., "USD")
     * @return a new Money instance
     * @throws IllegalArgumentException if amount is null or currency code is invalid
     */
    public static Money of(BigDecimal amount, String currencyCode) {
        return of(amount, CurrencyCode.of(currencyCode));
    }

    /**
     * Create a Money instance from an amount and CurrencyCode.
     *
     * @param amount the monetary amount as BigDecimal
     * @param currency the CurrencyCode
     * @return a new Money instance
     * @throws IllegalArgumentException if amount is null or negative
     */
    public static Money of(BigDecimal amount, CurrencyCode currency) {
        if (amount == null) {
            throw new IllegalArgumentException("Amount must not be null");
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount must not be negative: " + amount);
        }
        if (currency == null) {
            throw new IllegalArgumentException("Currency must not be null");
        }
        
        // Normalize the amount to the currency's fraction digits
        int fractionDigits = currency.getFractionDigits();
        BigDecimal normalizedAmount = amount.setScale(fractionDigits, RoundingMode.HALF_UP);
        
        return new Money(normalizedAmount, currency);
    }

    /**
     * Create a Money instance from a double amount and currency code.
     *
     * @param amount the monetary amount as double
     * @param currencyCode the currency code (e.g., "USD")
     * @return a new Money instance
     */
    public static Money of(double amount, String currencyCode) {
        return of(BigDecimal.valueOf(amount), currencyCode);
    }

    /**
     * Get the amount.
     *
     * @return the BigDecimal amount
     */
    public BigDecimal getAmount() {
        return amount;
    }

    /**
     * Get the currency.
     *
     * @return the CurrencyCode
     */
    public CurrencyCode getCurrency() {
        return currency;
    }

    /**
     * Add another Money to this Money.
     * Both Money instances must have the same currency.
     *
     * @param other the Money to add
     * @return a new Money instance with the sum
     * @throws IllegalArgumentException if currencies don't match
     */
    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException(
                    "Cannot add different currencies: " + this.currency + " and " + other.currency
            );
        }
        return Money.of(this.amount.add(other.amount), this.currency);
    }

    /**
     * Subtract another Money from this Money.
     * Both Money instances must have the same currency.
     *
     * @param other the Money to subtract
     * @return a new Money instance with the difference
     * @throws IllegalArgumentException if currencies don't match or result would be negative
     */
    public Money subtract(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException(
                    "Cannot subtract different currencies: " + this.currency + " and " + other.currency
            );
        }
        BigDecimal result = this.amount.subtract(other.amount);
        if (result.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Result of subtraction cannot be negative: " + this.amount + " - " + other.amount
            );
        }
        return Money.of(result, this.currency);
    }

    /**
     * Multiply this Money by a factor.
     *
     * @param factor the multiplication factor
     * @return a new Money instance with the product
     * @throws IllegalArgumentException if factor is negative
     */
    public Money multiply(BigDecimal factor) {
        if (factor.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Multiplication factor must not be negative: " + factor);
        }
        return Money.of(this.amount.multiply(factor), this.currency);
    }

    /**
     * Multiply this Money by a factor.
     *
     * @param factor the multiplication factor as double
     * @return a new Money instance with the product
     */
    public Money multiply(double factor) {
        return multiply(BigDecimal.valueOf(factor));
    }

    /**
     * Check if this Money is zero.
     *
     * @return true if amount is zero
     */
    public boolean isZero() {
        return amount.compareTo(BigDecimal.ZERO) == 0;
    }

    /**
     * Check if this Money is greater than another Money.
     * Both Money instances must have the same currency.
     *
     * @param other the Money to compare
     * @return true if this Money is greater
     */
    public boolean isGreaterThan(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException(
                    "Cannot compare different currencies: " + this.currency + " and " + other.currency
            );
        }
        return this.amount.compareTo(other.amount) > 0;
    }

    /**
     * Check if this Money is less than another Money.
     *
     * @param other the Money to compare
     * @return true if this Money is less
     */
    public boolean isLessThan(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException(
                    "Cannot compare different currencies: " + this.currency + " and " + other.currency
            );
        }
        return this.amount.compareTo(other.amount) < 0;
    }

    /**
     * Check if this Money is equal to another Money (both amount and currency).
     *
     * @param other the Money to compare
     * @return true if both amount and currency are equal
     */
    public boolean isEqualTo(Money other) {
        if (!this.currency.equals(other.currency)) {
            return false;
        }
        return this.amount.compareTo(other.amount) == 0;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Money)) return false;
        Money money = (Money) o;
        return Objects.equals(amount, money.amount) &&
               Objects.equals(currency, money.currency);
    }

    @Override
    public int hashCode() {
        return Objects.hash(amount, currency);
    }

    @Override
    public String toString() {
        return amount + " " + currency;
    }
}
