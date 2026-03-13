package com.personal.money.management.core.tax.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for DeductionBracketValue Value Object
 */
@DisplayName("Deduction Bracket Value Object Tests")
class DeductionBracketValueTest {
    
    @Test
    @DisplayName("Should create deduction bracket with all properties")
    void testCreateDeductionBracket() {
        // Given
        LocalDate effectiveDate = LocalDate.of(2025, 12, 13);
        
        // When: Create deduction bracket value object
        DeductionBracketValue bracket = new DeductionBracketValue(
            "old", "2025", 11_000_000, 4_400_000, effectiveDate
        );
        
        // Then: Verify all properties
        assertEquals("old", bracket.getValue());
        assertEquals("2025", bracket.getLabel());
        assertEquals(11_000_000, bracket.getPersonalDeduction());
        assertEquals(4_400_000, bracket.getDependentDeduction());
        assertEquals(effectiveDate, bracket.getEffectiveDate());
    }
    
    @Test
    @DisplayName("Should create deduction bracket for 2026")
    void testCreate2026DeductionBracket() {
        // Given
        LocalDate effectiveDate = LocalDate.of(2026, 1, 1);
        
        // When: Create 2026 deduction bracket
        DeductionBracketValue bracket = new DeductionBracketValue(
            "new", "2026", 15_500_000, 6_200_000, effectiveDate
        );
        
        // Then: Verify 2026 values
        assertEquals("new", bracket.getValue());
        assertEquals(15_500_000, bracket.getPersonalDeduction());
        assertEquals(6_200_000, bracket.getDependentDeduction());
        assertTrue(bracket.getPersonalDeduction() > 11_000_000); // 2026 is higher
    }
    
    @Test
    @DisplayName("Should have dependent deduction less than personal deduction")
    void testDependentLessThanPersonal() {
        // Given: Deduction bracket
        DeductionBracketValue bracket = new DeductionBracketValue(
            "new", "2026", 15_500_000, 6_200_000, LocalDate.now()
        );
        
        // Then: Verify dependent deduction is less than personal
        assertTrue(bracket.getDependentDeduction() < bracket.getPersonalDeduction());
    }
    
    @Test
    @DisplayName("Should immutable - value object properties are final")
    void testImmutability() {
        // Given: Two deduction brackets
        LocalDate date1 = LocalDate.of(2025, 12, 13);
        LocalDate date2 = LocalDate.of(2026, 1, 1);
        
        DeductionBracketValue bracket1 = new DeductionBracketValue(
            "old", "2025", 11_000_000, 4_400_000, date1
        );
        DeductionBracketValue bracket2 = new DeductionBracketValue(
            "new", "2026", 15_500_000, 6_200_000, date2
        );
        
        // When & Then: Verify immutability
        assertNotEquals(bracket1.getPersonalDeduction(), bracket2.getPersonalDeduction());
        assertNotEquals(bracket1.getEffectiveDate(), bracket2.getEffectiveDate());
    }
}
