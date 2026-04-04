package com.personal.money.management.core.tax.domain.model;

import com.personal.money.management.core.tax.domain.service.InsuranceBreakdown;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for InsuranceBreakdown Value Object
 */
@DisplayName("Insurance Breakdown Value Object Tests")
class InsuranceBreakdownTest {

    @Test
    @DisplayName("Should create insurance breakdown with correct values")
    void testCreateInsuranceBreakdown() {
        // Given & When
        InsuranceBreakdown breakdown = new InsuranceBreakdown(
            3_744_000,  // BHXH
            702_000,    // BHYT
            104_000,    // BHTN
            4_550_000   // Total
        );

        // Then
        assertEquals(3_744_000, breakdown.getBhxh());
        assertEquals(702_000, breakdown.getBhyt());
        assertEquals(104_000, breakdown.getBhtn());
        assertEquals(4_550_000, breakdown.getTotalInsurance());
    }

    @Test
    @DisplayName("Should handle zero insurance amounts")
    void testZeroInsuranceAmounts() {
        // Given & When
        InsuranceBreakdown breakdown = new InsuranceBreakdown(0, 0, 0, 0);

        // Then
        assertEquals(0, breakdown.getBhxh());
        assertEquals(0, breakdown.getBhyt());
        assertEquals(0, breakdown.getBhtn());
        assertEquals(0, breakdown.getTotalInsurance());
    }

    @Test
    @DisplayName("Should handle large insurance amounts")
    void testLargeInsuranceAmounts() {
        // Given & When
        InsuranceBreakdown breakdown = new InsuranceBreakdown(
            10_000_000,
            2_000_000,
            1_000_000,
            13_000_000
        );

        // Then
        assertEquals(10_000_000, breakdown.getBhxh());
        assertEquals(2_000_000, breakdown.getBhyt());
        assertEquals(1_000_000, breakdown.getBhtn());
        assertEquals(13_000_000, breakdown.getTotalInsurance());
    }

    @Test
    @DisplayName("Should verify total insurance equals sum of components")
    void testTotalInsuranceCalculation() {
        // Given
        long bhxh = 3_744_000;
        long bhyt = 702_000;
        long bhtn = 104_000;
        long total = bhxh + bhyt + bhtn;

        // When
        InsuranceBreakdown breakdown = new InsuranceBreakdown(bhxh, bhyt, bhtn, total);

        // Then
        assertEquals(bhxh + bhyt + bhtn, breakdown.getTotalInsurance());
    }

    @Test
    @DisplayName("Should handle BHXH (Social Insurance)")
    void testBhxhComponent() {
        // Given & When
        InsuranceBreakdown breakdown = new InsuranceBreakdown(
            5_000_000, 1_000_000, 500_000, 6_500_000
        );

        // Then
        assertEquals(5_000_000, breakdown.getBhxh());
    }

    @Test
    @DisplayName("Should handle BHYT (Health Insurance)")
    void testBhytComponent() {
        // Given & When
        InsuranceBreakdown breakdown = new InsuranceBreakdown(
            5_000_000, 1_000_000, 500_000, 6_500_000
        );

        // Then
        assertEquals(1_000_000, breakdown.getBhyt());
    }

    @Test
    @DisplayName("Should handle BHTN (Unemployment Insurance)")
    void testBhtnComponent() {
        // Given & When
        InsuranceBreakdown breakdown = new InsuranceBreakdown(
            5_000_000, 1_000_000, 500_000, 6_500_000
        );

        // Then
        assertEquals(500_000, breakdown.getBhtn());
    }
}
