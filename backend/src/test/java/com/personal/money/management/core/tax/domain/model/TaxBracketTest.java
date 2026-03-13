package com.personal.money.management.core.tax.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for TaxBracket Value Object
 */
@DisplayName("Tax Bracket Value Object Tests")
class TaxBracketTest {
    
    @Test
    @DisplayName("Should create tax bracket with correct threshold and rate")
    void testCreateTaxBracket() {
        // Given & When: Create tax bracket
        TaxBracket bracket = new TaxBracket(5_000_000, 0.05);
        
        // Then: Verify properties
        assertEquals(5_000_000, bracket.getThreshold());
        assertEquals(0.05, bracket.getRate());
    }
    
    @Test
    @DisplayName("Should handle unlimited bracket with Long.MAX_VALUE threshold")
    void testCreateUnlimitedBracket() {
        // Given & When: Create unlimited bracket
        TaxBracket bracket = new TaxBracket(Long.MAX_VALUE, 0.35);
        
        // Then: Verify unlimited threshold
        assertEquals(Long.MAX_VALUE, bracket.getThreshold());
        assertEquals(0.35, bracket.getRate());
    }
    
    @Test
    @DisplayName("Should accept zero rate for base bracket")
    void testCreateZeroRateBracket() {
        // Given & When: Create bracket with zero rate
        TaxBracket bracket = new TaxBracket(0, 0.0);
        
        // Then: Verify zero rate
        assertEquals(0, bracket.getThreshold());
        assertEquals(0.0, bracket.getRate());
    }
}
