package com.personal.money.management.core.shared.domain.valueobject;

import java.util.Objects;

/**
 * Value Object representing an account name.
 * 
 * This VO encapsulates account name validation logic:
 * - Must not be blank
 * - Maximum length is 100 characters
 * - Trimmed on creation
 * 
 * It's immutable and compared by value.
 */
public class AccountName {
    private static final int MAX_LENGTH = 100;
    private final String name;

    private AccountName(String name) {
        this.name = name;
    }

    /**
     * Create an AccountName from a string.
     * 
     * Validates:
     * - Name is not blank
     * - Name is <= 100 characters
     *
     * @param name the account name
     * @return a new AccountName instance
     * @throws IllegalArgumentException if name is invalid
     */
    public static AccountName of(String name) {
        if (name == null) {
            throw new IllegalArgumentException("Account name must not be null");
        }
        
        String trimmed = name.trim();
        
        if (trimmed.isBlank()) {
            throw new IllegalArgumentException("Account name must not be blank");
        }
        
        if (trimmed.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                    "Account name must not exceed " + MAX_LENGTH + " characters, got: " + trimmed.length()
            );
        }
        
        return new AccountName(trimmed);
    }

    /**
     * Get the account name as a string.
     *
     * @return the account name
     */
    public String getValue() {
        return name;
    }

    /**
     * Get the length of the account name.
     *
     * @return the name length
     */
    public int length() {
        return name.length();
    }

    /**
     * Check if the name contains a specific substring (case-insensitive).
     *
     * @param substring the substring to search for
     * @return true if the name contains the substring
     */
    public boolean containsIgnoreCase(String substring) {
        if (substring == null || substring.isBlank()) {
            return false;
        }
        return name.toLowerCase().contains(substring.toLowerCase());
    }

    /**
     * Check if the name starts with a specific prefix (case-insensitive).
     *
     * @param prefix the prefix to check
     * @return true if the name starts with the prefix
     */
    public boolean startsWithIgnoreCase(String prefix) {
        if (prefix == null || prefix.isBlank()) {
            return false;
        }
        return name.toLowerCase().startsWith(prefix.toLowerCase());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AccountName)) return false;
        AccountName that = (AccountName) o;
        return Objects.equals(name, that.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }

    @Override
    public String toString() {
        return name;
    }
}
