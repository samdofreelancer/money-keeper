package com.personal.money.management.core.shared.domain.valueobject;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Money Value Object Tests")
class MoneyTest {

    @Test
    @DisplayName("Should create Money with BigDecimal and currency code")
    void testCreateMoneyWithStringCurrency() {
        Money money = Money.of(BigDecimal.valueOf(100.50), "USD");
        assertNotNull(money);
        assertEquals(new BigDecimal("100.50"), money.getAmount());
        assertEquals("USD", money.getCurrency().getCode());
    }

    @Test
    @DisplayName("Should create Money with BigDecimal and CurrencyCode")
    void testCreateMoneyWithCurrencyCode() {
        CurrencyCode currency = CurrencyCode.of("EUR");
        Money money = Money.of(BigDecimal.valueOf(50.00), currency);
        assertNotNull(money);
        assertEquals(new BigDecimal("50.00"), money.getAmount());
        assertEquals(currency, money.getCurrency());
    }

    @Test
    @DisplayName("Should create Money with double amount")
    void testCreateMoneyWithDouble() {
        Money money = Money.of(100.50, "USD");
        assertNotNull(money);
        assertTrue(money.getAmount().compareTo(BigDecimal.valueOf(100.50)) == 0);
    }

    @Test
    @DisplayName("Should throw exception for null amount")
    void testCreateMoneyNullAmount() {
        assertThrows(IllegalArgumentException.class, () -> Money.of(null, "USD"));
    }

    @Test
    @DisplayName("Should throw exception for negative amount")
    void testCreateMoneyNegativeAmount() {
        assertThrows(IllegalArgumentException.class, () -> Money.of(BigDecimal.valueOf(-10), "USD"));
    }

    @Test
    @DisplayName("Should throw exception for null currency")
    void testCreateMoneyNullCurrency() {
        assertThrows(IllegalArgumentException.class, () -> Money.of(BigDecimal.valueOf(100), (CurrencyCode) null));
    }

    @Test
    @DisplayName("Should normalize amount to currency fraction digits")
    void testAmountNormalization() {
        Money money = Money.of(BigDecimal.valueOf(100.999), "USD");
        assertEquals(new BigDecimal("101.00"), money.getAmount());
    }

    @Test
    @DisplayName("Should have fraction digits 0 for JPY")
    void testJPYFractionDigits() {
        Money money = Money.of(1000, "JPY");
        assertEquals(new BigDecimal("1000"), money.getAmount());
    }

    @Test
    @DisplayName("Should add two Money with same currency")
    void testAddMoneySameCurrency() {
        Money money1 = Money.of(100, "USD");
        Money money2 = Money.of(50.50, "USD");
        Money result = money1.add(money2);
        
        assertEquals(new BigDecimal("150.50"), result.getAmount());
        assertEquals("USD", result.getCurrency().getCode());
    }

    @Test
    @DisplayName("Should throw exception adding Money with different currencies")
    void testAddMoneyDifferentCurrencies() {
        Money usd = Money.of(100, "USD");
        Money eur = Money.of(50, "EUR");
        
        assertThrows(IllegalArgumentException.class, () -> usd.add(eur));
    }

    @Test
    @DisplayName("Should subtract two Money with same currency")
    void testSubtractMoneySameCurrency() {
        Money money1 = Money.of(100, "USD");
        Money money2 = Money.of(30, "USD");
        Money result = money1.subtract(money2);
        
        assertEquals(new BigDecimal("70.00"), result.getAmount());
        assertEquals("USD", result.getCurrency().getCode());
    }

    @Test
    @DisplayName("Should throw exception subtracting Money with different currencies")
    void testSubtractMoneyDifferentCurrencies() {
        Money usd = Money.of(100, "USD");
        Money eur = Money.of(50, "EUR");
        
        assertThrows(IllegalArgumentException.class, () -> usd.subtract(eur));
    }

    @Test
    @DisplayName("Should throw exception when subtraction result would be negative")
    void testSubtractMoneyResultNegative() {
        Money money1 = Money.of(50, "USD");
        Money money2 = Money.of(100, "USD");
        
        assertThrows(IllegalArgumentException.class, () -> money1.subtract(money2));
    }

    @Test
    @DisplayName("Should multiply Money by BigDecimal factor")
    void testMultiplyMoneyByBigDecimal() {
        Money money = Money.of(100, "USD");
        Money result = money.multiply(new BigDecimal("2.5"));
        
        assertEquals(new BigDecimal("250.00"), result.getAmount());
        assertEquals("USD", result.getCurrency().getCode());
    }

    @Test
    @DisplayName("Should multiply Money by double factor")
    void testMultiplyMoneyByDouble() {
        Money money = Money.of(100, "USD");
        Money result = money.multiply(1.5);
        
        assertEquals(new BigDecimal("150.00"), result.getAmount());
    }

    @Test
    @DisplayName("Should throw exception for negative multiplication factor")
    void testMultiplyMoneyNegativeFactor() {
        Money money = Money.of(100, "USD");
        
        assertThrows(IllegalArgumentException.class, () -> money.multiply(BigDecimal.valueOf(-1)));
    }

    @Test
    @DisplayName("Should identify zero Money")
    void testIsZero() {
        Money zero = Money.of(0, "USD");
        Money nonZero = Money.of(100, "USD");
        
        assertTrue(zero.isZero());
        assertFalse(nonZero.isZero());
    }

    @Test
    @DisplayName("Should compare Money greater than")
    void testIsGreaterThan() {
        Money money1 = Money.of(100, "USD");
        Money money2 = Money.of(50, "USD");
        
        assertTrue(money1.isGreaterThan(money2));
        assertFalse(money2.isGreaterThan(money1));
    }

    @Test
    @DisplayName("Should compare Money less than")
    void testIsLessThan() {
        Money money1 = Money.of(50, "USD");
        Money money2 = Money.of(100, "USD");
        
        assertTrue(money1.isLessThan(money2));
        assertFalse(money2.isLessThan(money1));
    }

    @Test
    @DisplayName("Should check Money equality")
    void testIsEqualTo() {
        Money money1 = Money.of(100, "USD");
        Money money2 = Money.of(100, "USD");
        Money money3 = Money.of(50, "USD");
        
        assertTrue(money1.isEqualTo(money2));
        assertFalse(money1.isEqualTo(money3));
    }

    @Test
    @DisplayName("Should throw exception comparing Money with different currencies")
    void testCompareMoneyDifferentCurrencies() {
        Money usd = Money.of(100, "USD");
        Money eur = Money.of(100, "EUR");
        
        assertThrows(IllegalArgumentException.class, () -> usd.isGreaterThan(eur));
        assertThrows(IllegalArgumentException.class, () -> usd.isLessThan(eur));
    }

    @Test
    @DisplayName("Should have equal Money instances with same amount and currency")
    void testEquals() {
        Money money1 = Money.of(100, "USD");
        Money money2 = Money.of(100, "USD");
        
        assertEquals(money1, money2);
    }

    @Test
    @DisplayName("Should have different Money instances with different amounts or currencies")
    void testNotEquals() {
        Money money1 = Money.of(100, "USD");
        Money money2 = Money.of(50, "USD");
        Money money3 = Money.of(100, "EUR");
        
        assertNotEquals(money1, money2);
        assertNotEquals(money1, money3);
    }

    @Test
    @DisplayName("Should have same hashCode for equal Money instances")
    void testHashCode() {
        Money money1 = Money.of(100, "USD");
        Money money2 = Money.of(100, "USD");
        
        assertEquals(money1.hashCode(), money2.hashCode());
    }

    @Test
    @DisplayName("Should have toString with amount and currency")
    void testToString() {
        Money money = Money.of(100, "USD");
        String str = money.toString();
        
        assertTrue(str.contains("100"));
        assertTrue(str.contains("USD"));
    }

    @Test
    @DisplayName("Should perform arithmetic with multiple operations")
    void testMultipleOperations() {
        Money initial = Money.of(1000, "USD");
        Money purchase1 = Money.of(200, "USD");
        Money purchase2 = Money.of(150, "USD");
        Money income = Money.of(500, "USD");
        
        Money balance = initial.subtract(purchase1).subtract(purchase2).add(income);
        
        assertEquals(new BigDecimal("1150.00"), balance.getAmount());
    }
}
