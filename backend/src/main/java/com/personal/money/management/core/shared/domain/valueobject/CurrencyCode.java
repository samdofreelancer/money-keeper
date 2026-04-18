package com.personal.money.management.core.shared.domain.valueobject;

import java.util.Currency;
import java.util.Locale;
import java.util.Map;
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
     * Also accepts common currency display names (e.g., "Euro" -> "EUR", "US Dollar" -> "USD").
     *
     * @param code the currency code (e.g., "USD", "EUR") or display name (e.g., "Euro", "US Dollar")
     * @return a new CurrencyCode instance
     * @throws IllegalArgumentException if the code is invalid
     */
    public static CurrencyCode of(String code) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Currency code must not be blank");
        }
        
        String input = code.trim();
        String upperCode = input.toUpperCase();
        
        // First, try as a direct ISO 4217 code
        try {
            Currency currency = Currency.getInstance(upperCode);
            return new CurrencyCode(upperCode, currency);
        } catch (IllegalArgumentException e) {
            // If direct code fails, try to resolve as a display name
            String resolvedCode = resolveDisplayNameToCode(input);
            if (resolvedCode != null) {
                try {
                    Currency currency = Currency.getInstance(resolvedCode);
                    return new CurrencyCode(resolvedCode, currency);
                } catch (IllegalArgumentException ex) {
                    // This shouldn't happen if our mapping is correct
                    throw new IllegalArgumentException("Invalid currency code: " + code, ex);
                }
            }
            
            throw new IllegalArgumentException("Invalid currency code or unknown currency name: " + code, e);
        }
    }

    /**
     * Resolve common currency display names to their ISO 4217 codes.
     * Maps display names like "Euro", "US Dollar" to codes like "EUR", "USD".
     *
     * @param displayName the currency display name
     * @return the ISO 4217 code if found, null otherwise
     */
    private static String resolveDisplayNameToCode(String displayName) {
        // Mapping of common currency display names to ISO codes
        Map<String, String> nameToCodeMapping = Map.ofEntries(
            Map.entry("EURO", "EUR"),
            Map.entry("US DOLLAR", "USD"),
            Map.entry("US$", "USD"),
            Map.entry("POUND", "GBP"),
            Map.entry("BRITISH POUND", "GBP"),
            Map.entry("YEN", "JPY"),
            Map.entry("YUAN", "CNY"),
            Map.entry("YUAN RENMINBI", "CNY"),
            Map.entry("RUPEE", "INR"),
            Map.entry("INDIAN RUPEE", "INR"),
            Map.entry("PESETA", "ESP"),
            Map.entry("FRANC", "CHF"),
            Map.entry("SWISS FRANC", "CHF"),
            Map.entry("DOLLAR", "USD"),
            Map.entry("SWEDISH KRONA", "SEK"),
            Map.entry("NORWEGIAN KRONE", "NOK"),
            Map.entry("DANISH KRONE", "DKK"),
            Map.entry("CANADIAN DOLLAR", "CAD"),
            Map.entry("AUSTRALIAN DOLLAR", "AUD"),
            Map.entry("NEW ZEALAND DOLLAR", "NZD"),
            Map.entry("SINGAPORE DOLLAR", "SGD"),
            Map.entry("HONG KONG DOLLAR", "HKD"),
            Map.entry("THAI BAHT", "THB"),
            Map.entry("MEXICAN PESO", "MXN"),
            Map.entry("BRAZILIAN REAL", "BRL"),
            Map.entry("SOUTH AFRICAN RAND", "ZAR")
        );
        
        String upperName = displayName.toUpperCase().trim();
        return nameToCodeMapping.get(upperName);
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
