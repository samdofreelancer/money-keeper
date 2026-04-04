package com.personal.money.management.core.tax.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for SalaryCalculationInput Value Object
 */
@DisplayName("Salary Calculation Input Value Object Tests")
class SalaryCalculationInputTest {

    private WageZoneValue createTestWageZone() {
        return new WageZoneValue("vung-1", "Vùng 1", 7_333_000, 20_790_000);
    }

    @Test
    @DisplayName("Should create salary calculation input with all properties")
    void testCreateSalaryCalculationInput() {
        // Given & When
        WageZoneValue wageZone = createTestWageZone();
        SalaryCalculationInput input = new SalaryCalculationInput(
            50_000_000,    // gross salary
            10_000_000,    // tet bonus
            46_800_000,    // insurance base
            2,             // dependents
            8.0,           // bhxh rate
            1.5,           // bhyt rate
            0.5,           // bhtn rate
            11_000_000,    // personal deduction
            4_400_000,     // dependent deduction per person
            500_000,       // tax free allowance
            100_000,       // other deduction
            TaxBracketType.SEVEN_BRACKET,
            wageZone
        );

        // Then
        assertEquals(50_000_000, input.getGrossSalary());
        assertEquals(10_000_000, input.getTetBonus());
        assertEquals(46_800_000, input.getInsuranceBase());
        assertEquals(2, input.getDependents());
        assertEquals(8.0, input.getBhxhRate());
        assertEquals(1.5, input.getBhytRate());
        assertEquals(0.5, input.getBhtnRate());
        assertEquals(11_000_000, input.getPersonalDeduction());
        assertEquals(4_400_000, input.getDependentDeductionPerPerson());
        assertEquals(500_000, input.getTaxFreeAllowance());
        assertEquals(100_000, input.getOtherDeduction());
        assertEquals(TaxBracketType.SEVEN_BRACKET, input.getTaxBracketType());
        assertNotNull(input.getWageZone());
    }

    @Test
    @DisplayName("Should handle maximum number of dependents")
    void testMaximumDependents() {
        // Given & When
        SalaryCalculationInput input = new SalaryCalculationInput(
            50_000_000, 0, 46_800_000, 10, 8.0, 1.5, 0.5,
            11_000_000, 4_400_000, 0, 0,
            TaxBracketType.SEVEN_BRACKET, createTestWageZone()
        );

        // Then
        assertEquals(10, input.getDependents());
    }

    @Test
    @DisplayName("Should handle zero bonus")
    void testZeroBonus() {
        // Given & When
        SalaryCalculationInput input = new SalaryCalculationInput(
            50_000_000, 0, 46_800_000, 0, 8.0, 1.5, 0.5,
            11_000_000, 4_400_000, 0, 0,
            TaxBracketType.SEVEN_BRACKET, createTestWageZone()
        );

        // Then
        assertEquals(0, input.getTetBonus());
    }

    @Test
    @DisplayName("Should handle high income with large bonus")
    void testHighIncomeWithBonus() {
        // Given & When
        SalaryCalculationInput input = new SalaryCalculationInput(
            100_000_000, 50_000_000, 46_800_000, 2, 8.0, 1.5, 0.5,
            11_000_000, 4_400_000, 3_000_000, 1_000_000,
            TaxBracketType.SEVEN_BRACKET, createTestWageZone()
        );

        // Then
        assertEquals(100_000_000, input.getGrossSalary());
        assertEquals(50_000_000, input.getTetBonus());
        assertEquals(3_000_000, input.getTaxFreeAllowance());
    }

    @Test
    @DisplayName("Should support different tax bracket types")
    void testDifferentTaxBracketTypes() {
        // Given & When
        SalaryCalculationInput input5Bracket = new SalaryCalculationInput(
            50_000_000, 0, 46_800_000, 0, 8.0, 1.5, 0.5,
            11_000_000, 4_400_000, 0, 0,
            TaxBracketType.FIVE_BRACKET, createTestWageZone()
        );

        SalaryCalculationInput input7Bracket = new SalaryCalculationInput(
            50_000_000, 0, 46_800_000, 0, 8.0, 1.5, 0.5,
            11_000_000, 4_400_000, 0, 0,
            TaxBracketType.SEVEN_BRACKET, createTestWageZone()
        );

        // Then
        assertEquals(TaxBracketType.FIVE_BRACKET, input5Bracket.getTaxBracketType());
        assertEquals(TaxBracketType.SEVEN_BRACKET, input7Bracket.getTaxBracketType());
    }

    @Test
    @DisplayName("Should access insurance rates")
    void testInsuranceRates() {
        // Given & When
        SalaryCalculationInput input = new SalaryCalculationInput(
            50_000_000, 0, 46_800_000, 0, 8.0, 1.5, 0.5,
            11_000_000, 4_400_000, 0, 0,
            TaxBracketType.SEVEN_BRACKET, createTestWageZone()
        );

        // Then
        assertEquals(8.0, input.getBhxhRate());
        assertEquals(1.5, input.getBhytRate());
        assertEquals(0.5, input.getBhtnRate());
    }

    @Test
    @DisplayName("Should handle zero tax free allowance")
    void testZeroTaxFreeAllowance() {
        // Given & When
        SalaryCalculationInput input = new SalaryCalculationInput(
            50_000_000, 0, 46_800_000, 0, 8.0, 1.5, 0.5,
            11_000_000, 4_400_000, 0, 0,
            TaxBracketType.SEVEN_BRACKET, createTestWageZone()
        );

        // Then
        assertEquals(0, input.getTaxFreeAllowance());
    }

    @Test
    @DisplayName("Should handle zero other deductions")
    void testZeroOtherDeductions() {
        // Given & When
        SalaryCalculationInput input = new SalaryCalculationInput(
            50_000_000, 0, 46_800_000, 0, 8.0, 1.5, 0.5,
            11_000_000, 4_400_000, 500_000, 0,
            TaxBracketType.SEVEN_BRACKET, createTestWageZone()
        );

        // Then
        assertEquals(0, input.getOtherDeduction());
    }

    @Test
    @DisplayName("Should access wage zone information")
    void testWageZoneAccess() {
        // Given
        WageZoneValue wageZone = createTestWageZone();

        // When
        SalaryCalculationInput input = new SalaryCalculationInput(
            50_000_000, 0, 46_800_000, 0, 8.0, 1.5, 0.5,
            11_000_000, 4_400_000, 0, 0,
            TaxBracketType.SEVEN_BRACKET, wageZone
        );

        // Then
        assertEquals(wageZone, input.getWageZone());
        assertEquals(20_790_000, input.getWageZone().getInsuranceCap());
    }
}
