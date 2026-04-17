package com.personal.money.management.core.shared.domain.valueobject;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("CurrencyCode Value Object Tests")
class CurrencyCodeTest {

    @Test
    @DisplayName("Should create valid currency code for USD")
    void testCreateValidCurrencyCodeUSD() {
        CurrencyCode code = CurrencyCode.of("USD");
        assertNotNull(code);
        assertEquals("USD", code.getCode());
        assertEquals("US Dollar", code.getDisplayName());
        assertEquals(2, code.getFractionDigits());
    }

    @Test
    @DisplayName("Should create valid currency code for EUR")
    void testCreateValidCurrencyCodeEUR() {
        CurrencyCode code = CurrencyCode.of("EUR");
        assertNotNull(code);
        assertEquals("EUR", code.getCode());
        assertEquals("Euro", code.getDisplayName());
        assertEquals(2, code.getFractionDigits());
    }

    @Test
    @DisplayName("Should create valid currency code for GBP")
    void testCreateValidCurrencyCodeGBP() {
        CurrencyCode code = CurrencyCode.of("GBP");
        assertNotNull(code);
        assertEquals("GBP", code.getCode());
    }

    @Test
    @DisplayName("Should accept lowercase currency code and convert to uppercase")
    void testCreateCurrencyCodeLowercase() {
        CurrencyCode code = CurrencyCode.of("usd");
        assertEquals("USD", code.getCode());
    }

    @Test
    @DisplayName("Should accept mixed case currency code")
    void testCreateCurrencyCodeMixedCase() {
        CurrencyCode code = CurrencyCode.of("UsD");
        assertEquals("USD", code.getCode());
    }

    @Test
    @DisplayName("Should throw exception for null currency code")
    void testCreateCurrencyCodeNull() {
        assertThrows(IllegalArgumentException.class, () -> CurrencyCode.of(null));
    }

    @Test
    @DisplayName("Should throw exception for blank currency code")
    void testCreateCurrencyCodeBlank() {
        assertThrows(IllegalArgumentException.class, () -> CurrencyCode.of(""));
        assertThrows(IllegalArgumentException.class, () -> CurrencyCode.of("   "));
    }

    @Test
    @DisplayName("Should throw exception for invalid currency code")
    void testCreateCurrencyCodeInvalid() {
        assertThrows(IllegalArgumentException.class, () -> CurrencyCode.of("INVALID"));
        assertThrows(IllegalArgumentException.class, () -> CurrencyCode.of("XYZ"));
    }

    @Test
    @DisplayName("Should return correct symbol for currency")
    void testGetSymbol() {
        CurrencyCode usd = CurrencyCode.of("USD");
        assertEquals("$", usd.getSymbol());
    }

    @Test
    @DisplayName("Should have correct fraction digits for JPY")
    void testFractionDigitsJPY() {
        CurrencyCode jpy = CurrencyCode.of("JPY");
        assertEquals(0, jpy.getFractionDigits());
    }

    @Test
    @DisplayName("Should have equal CurrencyCode instances with same code")
    void testEquals() {
        CurrencyCode code1 = CurrencyCode.of("USD");
        CurrencyCode code2 = CurrencyCode.of("USD");
        assertEquals(code1, code2);
    }

    @Test
    @DisplayName("Should have different CurrencyCode instances with different codes")
    void testNotEquals() {
        CurrencyCode usd = CurrencyCode.of("USD");
        CurrencyCode eur = CurrencyCode.of("EUR");
        assertNotEquals(usd, eur);
    }

    @Test
    @DisplayName("Should have same hashCode for equal CurrencyCode instances")
    void testHashCode() {
        CurrencyCode code1 = CurrencyCode.of("USD");
        CurrencyCode code2 = CurrencyCode.of("USD");
        assertEquals(code1.hashCode(), code2.hashCode());
    }

    @Test
    @DisplayName("Should have toString that returns the code")
    void testToString() {
        CurrencyCode code = CurrencyCode.of("USD");
        assertEquals("USD", code.toString());
    }
}
