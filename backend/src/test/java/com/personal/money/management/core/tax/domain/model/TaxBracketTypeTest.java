package com.personal.money.management.core.tax.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for TaxBracketType Enumeration
 */
@DisplayName("Tax Bracket Type Enumeration Tests")
class TaxBracketTypeTest {
    
    @Test
    @DisplayName("Should have SEVEN_BRACKET type")
    void testSevenBracketType() {
        // Given & When: Access seven bracket type
        TaxBracketType type = TaxBracketType.SEVEN_BRACKET;
        
        // Then: Verify properties
        assertEquals("7-bracket", type.getCode());
        assertNotNull(type.getDescription());
        assertTrue(type.isActive());
    }
    
    @Test
    @DisplayName("Should have FIVE_BRACKET type")
    void testFiveBracketType() {
        // Given & When: Access five bracket type
        TaxBracketType type = TaxBracketType.FIVE_BRACKET;
        
        // Then: Verify properties
        assertEquals("5-bracket", type.getCode());
        assertNotNull(type.getDescription());
        assertFalse(type.isActive()); // 5-bracket not active until 7/1/2026
    }
    
    @Test
    @DisplayName("Should retrieve bracket by code")
    void testFromCode() {
        // When: Find by code
        TaxBracketType type = TaxBracketType.fromCode("7-bracket");
        
        // Then: Should find correct type
        assertNotNull(type);
        assertEquals(TaxBracketType.SEVEN_BRACKET, type);
    }
    
    @Test
    @DisplayName("Should return null for invalid code")
    void testFromCodeInvalid() {
        // When & Then: Invalid code should return default SEVEN_BRACKET
        TaxBracketType type = TaxBracketType.fromCode("invalid-code");
        assertNotNull(type);
        assertEquals(TaxBracketType.SEVEN_BRACKET, type);
    }
    
    @Test
    @DisplayName("Should have all types defined")
    void testAllTypes() {
        // Given & When: Get all tax bracket types
        TaxBracketType[] types = TaxBracketType.values();
        
        // Then: Should have at least two types
        assertTrue(types.length >= 2);
        assertTrue(arrayContains(types, TaxBracketType.SEVEN_BRACKET));
        assertTrue(arrayContains(types, TaxBracketType.FIVE_BRACKET));
    }
    
    private boolean arrayContains(TaxBracketType[] array, TaxBracketType target) {
        for (TaxBracketType type : array) {
            if (type == target) {
                return true;
            }
        }
        return false;
    }
}
