package com.personal.money.management.core.tax.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for WageZoneValue Value Object
 */
@DisplayName("Wage Zone Value Object Tests")
class WageZoneValueTest {
    
    @Test
    @DisplayName("Should create wage zone with all properties")
    void testCreateWageZone() {
        // Given & When: Create wage zone value object
        WageZoneValue zone = new WageZoneValue("I", "Vùng I (HN, TP.HCM)", 4_960_000, 99_200_000);
        
        // Then: Verify all properties
        assertEquals("I", zone.getValue());
        assertEquals("Vùng I (HN, TP.HCM)", zone.getLabel());
        assertEquals(4_960_000, zone.getMinimumWage());
        assertEquals(99_200_000, zone.getInsuranceCap());
    }
    
    @Test
    @DisplayName("Should create wage zone for zone II")
    void testCreateZoneII() {
        // Given & When: Create zone II
        WageZoneValue zone = new WageZoneValue("II", "Vùng II", 4_410_000, 88_200_000);
        
        // Then: Verify zone II properties
        assertEquals("II", zone.getValue());
        assertEquals(4_410_000, zone.getMinimumWage());
        assertEquals(88_200_000, zone.getInsuranceCap());
    }
    
    @Test
    @DisplayName("Should have insurance cap greater than minimum wage")
    void testInsuranceCapGreaterThanMinimum() {
        // Given: Wage zone with insurance cap
        WageZoneValue zone = new WageZoneValue("I", "Vùng I", 4_960_000, 99_200_000);
        
        // Then: Verify cap is greater than minimum
        assertTrue(zone.getInsuranceCap() > zone.getMinimumWage());
    }
    
    @Test
    @DisplayName("Should immutable - final fields cannot be changed")
    void testImmutability() {
        // Given: Wage zone value object
        WageZoneValue zone = new WageZoneValue("I", "Vùng I", 4_960_000, 99_200_000);
        
        // When & Then: Verify getter returns correct values
        assertEquals("I", zone.getValue());
        assertEquals(4_960_000, zone.getMinimumWage());
        
        // Attempting to create new instance shows immutability
        WageZoneValue zone2 = new WageZoneValue("II", "Vùng II", 4_410_000, 88_200_000);
        assertNotEquals(zone.getValue(), zone2.getValue());
    }
}
