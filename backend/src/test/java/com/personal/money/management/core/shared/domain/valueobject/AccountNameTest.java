package com.personal.money.management.core.shared.domain.valueobject;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("AccountName Value Object Tests")
class AccountNameTest {

    @Test
    @DisplayName("Should create valid AccountName")
    void testCreateValidAccountName() {
        AccountName name = AccountName.of("My Savings Account");
        assertNotNull(name);
        assertEquals("My Savings Account", name.getValue());
    }

    @Test
    @DisplayName("Should trim whitespace from AccountName")
    void testTrimWhitespace() {
        AccountName name = AccountName.of("   My Savings Account   ");
        assertEquals("My Savings Account", name.getValue());
    }

    @Test
    @DisplayName("Should throw exception for null name")
    void testCreateAccountNameNull() {
        assertThrows(IllegalArgumentException.class, () -> AccountName.of(null));
    }

    @Test
    @DisplayName("Should throw exception for blank name")
    void testCreateAccountNameBlank() {
        assertThrows(IllegalArgumentException.class, () -> AccountName.of(""));
        assertThrows(IllegalArgumentException.class, () -> AccountName.of("   "));
        assertThrows(IllegalArgumentException.class, () -> AccountName.of("\t\n"));
    }

    @Test
    @DisplayName("Should throw exception for name exceeding max length")
    void testCreateAccountNameExceedsMaxLength() {
        String longName = "a".repeat(101);
        assertThrows(IllegalArgumentException.class, () -> AccountName.of(longName));
    }

    @Test
    @DisplayName("Should accept name at max length")
    void testCreateAccountNameAtMaxLength() {
        String maxName = "a".repeat(100);
        AccountName name = AccountName.of(maxName);
        assertEquals(100, name.length());
    }

    @Test
    @DisplayName("Should return correct length")
    void testLength() {
        AccountName name = AccountName.of("My Account");
        assertEquals(10, name.length());
    }

    @Test
    @DisplayName("Should check if name contains substring (case-insensitive)")
    void testContainsIgnoreCase() {
        AccountName name = AccountName.of("My Savings Account");
        
        assertTrue(name.containsIgnoreCase("savings"));
        assertTrue(name.containsIgnoreCase("SAVINGS"));
        assertTrue(name.containsIgnoreCase("SaViNgS"));
        assertTrue(name.containsIgnoreCase("My"));
        assertFalse(name.containsIgnoreCase("Checking"));
    }

    @Test
    @DisplayName("Should return false for null or blank substring")
    void testContainsIgnoreCaseNullOrBlank() {
        AccountName name = AccountName.of("My Savings Account");
        
        assertFalse(name.containsIgnoreCase(null));
        assertFalse(name.containsIgnoreCase(""));
        assertFalse(name.containsIgnoreCase("   "));
    }

    @Test
    @DisplayName("Should check if name starts with prefix (case-insensitive)")
    void testStartsWithIgnoreCase() {
        AccountName name = AccountName.of("My Savings Account");
        
        assertTrue(name.startsWithIgnoreCase("my"));
        assertTrue(name.startsWithIgnoreCase("MY"));
        assertTrue(name.startsWithIgnoreCase("My"));
        assertTrue(name.startsWithIgnoreCase("My Savings"));
        assertFalse(name.startsWithIgnoreCase("savings"));
    }

    @Test
    @DisplayName("Should return false for null or blank prefix")
    void testStartsWithIgnoreCaseNullOrBlank() {
        AccountName name = AccountName.of("My Savings Account");
        
        assertFalse(name.startsWithIgnoreCase(null));
        assertFalse(name.startsWithIgnoreCase(""));
        assertFalse(name.startsWithIgnoreCase("   "));
    }

    @Test
    @DisplayName("Should have equal AccountName instances with same value")
    void testEquals() {
        AccountName name1 = AccountName.of("My Account");
        AccountName name2 = AccountName.of("My Account");
        
        assertEquals(name1, name2);
    }

    @Test
    @DisplayName("Should have different AccountName instances with different values")
    void testNotEquals() {
        AccountName name1 = AccountName.of("My Account");
        AccountName name2 = AccountName.of("Other Account");
        
        assertNotEquals(name1, name2);
    }

    @Test
    @DisplayName("Should have same hashCode for equal AccountName instances")
    void testHashCode() {
        AccountName name1 = AccountName.of("My Account");
        AccountName name2 = AccountName.of("My Account");
        
        assertEquals(name1.hashCode(), name2.hashCode());
    }

    @Test
    @DisplayName("Should normalize case when comparing case variations with trim")
    void testCaseNormalization() {
        AccountName name1 = AccountName.of("My Account");
        AccountName name2 = AccountName.of("my account");
        
        // Note: equals is case-sensitive by design
        assertNotEquals(name1, name2);
    }

    @Test
    @DisplayName("Should have toString that returns the value")
    void testToString() {
        AccountName name = AccountName.of("My Account");
        assertEquals("My Account", name.toString());
    }

    @Test
    @DisplayName("Should accept special characters in name")
    void testSpecialCharactersInName() {
        AccountName name = AccountName.of("My-Account_123 (Savings)");
        assertEquals("My-Account_123 (Savings)", name.getValue());
    }

    @Test
    @DisplayName("Should accept unicode characters in name")
    void testUnicodeCharactersInName() {
        AccountName name = AccountName.of("我的账户 (My Account)");
        assertNotNull(name);
    }
}
