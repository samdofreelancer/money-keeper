package com.personal.money.management.core.shared.infrastructure.adapter;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("TaxAuthorityAdapter Anti-Corruption Layer Tests")
class TaxAuthorityAdapterTest {
    
    private final TaxAuthorityAdapter adapter = new StubTaxAuthorityAdapter();
    
    @Test
    @DisplayName("Should provide effective tax rate for income below first bracket")
    void testEffectiveTaxRateLowIncome() {
        BigDecimal rate = adapter.getEffectiveTaxRate("vn", BigDecimal.valueOf(3_000_000), LocalDate.now());
        
        assertNotNull(rate);
        assertEquals(BigDecimal.valueOf(0.05), rate);
    }
    
    @Test
    @DisplayName("Should provide effective tax rate for income in middle bracket")
    void testEffectiveTaxRateMiddleIncome() {
        BigDecimal rate = adapter.getEffectiveTaxRate("vn", BigDecimal.valueOf(7_500_000), LocalDate.now());
        
        assertNotNull(rate);
        assertEquals(BigDecimal.valueOf(0.10), rate);
    }
    
    @Test
    @DisplayName("Should provide effective tax rate for high income")
    void testEffectiveTaxRateHighIncome() {
        BigDecimal rate = adapter.getEffectiveTaxRate("vn", BigDecimal.valueOf(15_000_000), LocalDate.now());
        
        assertNotNull(rate);
        assertEquals(BigDecimal.valueOf(0.20), rate);
    }
    
    @Test
    @DisplayName("Should provide next tax bracket for income below first bracket")
    void testNextTaxBracketLowIncome() {
        BigDecimal nextBracket = adapter.getNextTaxBracket("vn", BigDecimal.valueOf(3_000_000), LocalDate.now());
        
        assertNotNull(nextBracket);
        assertEquals(BigDecimal.valueOf(5_000_000), nextBracket);
    }
    
    @Test
    @DisplayName("Should provide next tax bracket for income above first bracket")
    void testNextTaxBracketMiddleIncome() {
        BigDecimal nextBracket = adapter.getNextTaxBracket("vn", BigDecimal.valueOf(7_500_000), LocalDate.now());
        
        assertNotNull(nextBracket);
        assertEquals(BigDecimal.valueOf(10_000_000), nextBracket);
    }
    
    @Test
    @DisplayName("Should support Vietnam jurisdiction")
    void testSupportsVietnamJurisdiction() {
        assertTrue(adapter.supportsJurisdiction("vn"));
    }
    
    @Test
    @DisplayName("Should not support unsupported jurisdiction")
    void testDoesNotSupportUnsupportedJurisdiction() {
        assertFalse(adapter.supportsJurisdiction("us"));
    }
    
    @Test
    @DisplayName("Should throw exception for unsupported jurisdiction")
    void testUnsupportedJurisdiction() {
        assertThrows(TaxAuthorityException.class, () ->
            adapter.getEffectiveTaxRate("us", BigDecimal.valueOf(50_000), LocalDate.now())
        );
    }
    
    @Test
    @DisplayName("Should indicate adapter availability")
    void testAdapterAvailability() {
        assertTrue(adapter.isAvailable());
    }
    
    @Test
    @DisplayName("Anti-corruption layer shields domain from external tax API details")
    void testAntiCorruptionLayerIsolation() {
        // Domain code only sees adapter interface, never external tax API structure
        TaxAuthorityAdapter adapter = new StubTaxAuthorityAdapter();
        
        // Domain work is isolated from external service details
        BigDecimal rate = adapter.getEffectiveTaxRate("vn", BigDecimal.valueOf(8_000_000), LocalDate.now());
        
        // Domain receives transformed, verified data
        assertNotNull(rate);
        assertTrue(rate.compareTo(BigDecimal.ZERO) > 0);
        assertTrue(rate.compareTo(BigDecimal.ONE) < 0);
    }
}
