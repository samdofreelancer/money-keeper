package com.personal.money.management.core.shared.domain.valueobject;

import java.util.Currency;
import java.util.Objects;

/**
 * Value Object representing a currency code (e.g., USD, EUR, GBP).
 * 
 * This VO validates that the currency code is a valid ISO 4217 currency code.
 * It's immutable and compared by value.
 */
public class CurrencyCode {
    private final String code;
    private final Currency currency;

    private CurrencyCode(String code, Currency currency) {
        this.code = code;
        this.currency = currency;
    }

    /**
     * Create a CurrencyCode from a string code (e.g., "USD", "EUR").
     * Validates that the code is a valid ISO 4217 currency code.
     *
     * @param code the currency code (e.g., "USD", "EUR")
     * @return a new CurrencyCode instance
     * @throws IllegalArgumentException if the code is invalid
     */
    public static CurrencyCode of(String code) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Currency code must not be blank");
        }
        
        String upperCode = code.toUpperCase().trim();
        
        try {
            Currency currency = Currency.getInstance(upperCode);
            return new CurrencyCode(upperCode, currency);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid currency code: " + code, e);
        }
    }

    /**
     * Get the currency code as a string (e.g., "USD").
     *
     * @return the currency code
     */
    public String getCode() {
        return code;
    }

    /**
     * Get the underlying Java Currency object.
     *
     * @return the Currency instance
     */
    public Currency getCurrency() {
        return currency;
    }

    /**
     * Get the currency display name (e.g., "US Dollar").
     *
     * @return the display name
     */
    public String getDisplayName() {
        return currency.getDisplayName();
    }

    /**
     * Get the currency symbol (e.g., "$" for USD).
     *
     * @return the symbol
     */
    public String getSymbol() {
        return currency.getSymbol();
    }

    /**
     * Get the number of fractional digits for this currency.
     * Most currencies use 2, but some use 0, 1, or 3.
     *
     * @return the fraction digits
     */
    public int getFractionDigits() {
        return currency.getDefaultFractionDigits();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CurrencyCode)) return false;
        CurrencyCode that = (CurrencyCode) o;
        return Objects.equals(code, that.code);
    }

    @Override
    public int hashCode() {
        return Objects.hash(code);
    }

    @Override
    public String toString() {
        return code;
    }
}
