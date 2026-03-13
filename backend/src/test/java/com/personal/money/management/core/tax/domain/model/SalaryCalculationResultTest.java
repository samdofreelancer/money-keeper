package com.personal.money.management.core.tax.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for SalaryCalculationResult Value Object
 */
@DisplayName("Salary Calculation Result Value Object Tests")
class SalaryCalculationResultTest {

    @Test
    @DisplayName("Should create salary calculation result with all properties")
    void testCreateSalaryCalculationResult() {
        // Given & When
        SalaryCalculationResult result = new SalaryCalculationResult(
            50_000_000,      // gross salary
            3_744_000,       // bhxh
            702_000,         // bhyt
            104_000,         // bhtn
            4_550_000,       // total insurance
            45_450_000,      // income after insurance
            10_000_000,      // tet bonus
            15_400_000,      // total deduction
            40_050_000,      // taxable income
            2_400_000,       // total tax
            1_200_000,       // salary tax
            1_200_000,       // bonus tax
            44_250_000,      // net before allowance
            500_000,         // tax free allowance
            100_000,         // other deduction
            44_650_000,      // net monthly
            8_800_000,       // net bonus
            53_450_000       // total net salary
        );

        // Then
        assertEquals(50_000_000, result.getGrossSalary());
        assertEquals(3_744_000, result.getBhxh());
        assertEquals(702_000, result.getBhyt());
        assertEquals(104_000, result.getBhtn());
        assertEquals(4_550_000, result.getTotalInsurance());
        assertEquals(45_450_000, result.getIncomeAfterInsurance());
        assertEquals(10_000_000, result.getTetBonus());
        assertEquals(15_400_000, result.getTotalDeduction());
        assertEquals(40_050_000, result.getTaxableIncome());
        assertEquals(2_400_000, result.getTotalTax());
        assertEquals(1_200_000, result.getSalaryTax());
        assertEquals(1_200_000, result.getBonusTax());
        assertEquals(44_250_000, result.getNetBeforeAllowance());
        assertEquals(500_000, result.getTaxFreeAllowance());
        assertEquals(100_000, result.getOtherDeduction());
        assertEquals(44_650_000, result.getNetMonthly());
        assertEquals(8_800_000, result.getNetBonus());
        assertEquals(53_450_000, result.getTotalNetSalary());
    }

    @Test
    @DisplayName("Should verify insurance breakdown is correct")
    void testInsuranceBreakdown() {
        // Given
        long bhxh = 3_744_000;
        long bhyt = 702_000;
        long bhtn = 104_000;
        long totalInsurance = bhxh + bhyt + bhtn;

        // When
        SalaryCalculationResult result = new SalaryCalculationResult(
            50_000_000, bhxh, bhyt, bhtn, totalInsurance,
            45_450_000, 10_000_000, 15_400_000, 40_050_000,
            2_400_000, 1_200_000, 1_200_000,
            44_250_000, 500_000, 100_000, 44_650_000, 8_800_000, 53_450_000
        );

        // Then
        assertEquals(bhxh, result.getBhxh());
        assertEquals(bhyt, result.getBhyt());
        assertEquals(bhtn, result.getBhtn());
        assertEquals(totalInsurance, result.getTotalInsurance());
    }

    @Test
    @DisplayName("Should verify tax calculation consistency")
    void testTaxCalculationConsistency() {
        // Given
        long salaryTax = 1_000_000;
        long bonusTax = 500_000;
        long totalTax = salaryTax + bonusTax;

        // When
        SalaryCalculationResult result = new SalaryCalculationResult(
            50_000_000, 3_744_000, 702_000, 104_000, 4_550_000,
            45_450_000, 10_000_000, 15_400_000, 40_050_000,
            totalTax, salaryTax, bonusTax,
            45_250_000, 0, 0, 45_250_000, 9_500_000, 54_750_000
        );

        // Then
        assertEquals(salaryTax + bonusTax, result.getTotalTax());
    }

    @Test
    @DisplayName("Should verify net salary calculation")
    void testNetSalaryCalculation() {
        // Given
        long netMonthly = 40_000_000;
        long netBonus = 8_000_000;

        // When
        SalaryCalculationResult result = new SalaryCalculationResult(
            50_000_000, 3_744_000, 702_000, 104_000, 4_550_000,
            45_450_000, 10_000_000, 15_400_000, 40_050_000,
            2_400_000, 1_200_000, 1_200_000,
            39_500_000, 500_000, 100_000, netMonthly, netBonus, 48_000_000
        );

        // Then
        assertEquals(netMonthly + netBonus, result.getTotalNetSalary());
    }

    @Test
    @DisplayName("Should handle zero tax scenario")
    void testZeroTaxScenario() {
        // Given & When
        SalaryCalculationResult result = new SalaryCalculationResult(
            10_000_000, 1_000_000, 200_000, 100_000, 1_300_000,
            8_700_000, 0, 11_000_000, 0,
            0, 0, 0,
            8_700_000, 0, 0, 8_700_000, 0, 8_700_000
        );

        // Then
        assertEquals(0, result.getTotalTax());
        assertEquals(0, result.getSalaryTax());
        assertEquals(0, result.getBonusTax());
    }

    @Test
    @DisplayName("Should handle high income with bonus tax")
    void testHighIncomeWithBonusTax() {
        // Given & When
        long bonusTax = 5_000_000;
        long salaryTax = 8_000_000;

        SalaryCalculationResult result = new SalaryCalculationResult(
            100_000_000, 8_000_000, 1_500_000, 500_000, 10_000_000,
            90_000_000, 50_000_000, 24_200_000, 115_800_000,
            13_000_000, salaryTax, bonusTax,
            82_000_000, 3_000_000, 1_000_000, 84_000_000, 45_000_000, 129_000_000
        );

        // Then
        assertTrue(result.getBonusTax() > 0);
        assertEquals(salaryTax + bonusTax, result.getTotalTax());
    }

    @Test
    @DisplayName("Should handle allowances and deductions")
    void testAllowancesAndDeductions() {
        // Given
        long taxFreeAllowance = 2_000_000;
        long otherDeduction = 500_000;

        // When
        SalaryCalculationResult result = new SalaryCalculationResult(
            50_000_000, 3_744_000, 702_000, 104_000, 4_550_000,
            45_450_000, 10_000_000, 15_400_000, 40_050_000,
            2_400_000, 1_200_000, 1_200_000,
            44_250_000, taxFreeAllowance, otherDeduction, 45_750_000, 8_800_000, 54_550_000
        );

        // Then
        assertEquals(taxFreeAllowance, result.getTaxFreeAllowance());
        assertEquals(otherDeduction, result.getOtherDeduction());
    }

    @Test
    @DisplayName("Should verify no negative values")
    void testNoNegativeValues() {
        // Given & When
        SalaryCalculationResult result = new SalaryCalculationResult(
            50_000_000, 3_744_000, 702_000, 104_000, 4_550_000,
            45_450_000, 10_000_000, 15_400_000, 40_050_000,
            2_400_000, 1_200_000, 1_200_000,
            44_250_000, 500_000, 100_000, 44_650_000, 8_800_000, 53_450_000
        );

        // Then: All values should be non-negative
        assertTrue(result.getGrossSalary() >= 0);
        assertTrue(result.getBhxh() >= 0);
        assertTrue(result.getBhyt() >= 0);
        assertTrue(result.getBhtn() >= 0);
        assertTrue(result.getTotalTax() >= 0);
        assertTrue(result.getNetMonthly() >= 0);
        assertTrue(result.getNetBonus() >= 0);
    }

    @Test
    @DisplayName("Should handle zero bonus scenario")
    void testZeroBonusScenario() {
        // Given & When
        SalaryCalculationResult result = new SalaryCalculationResult(
            30_000_000, 2_400_000, 450_000, 75_000, 2_925_000,
            27_075_000, 0, 11_000_000, 16_075_000,
            1_000_000, 1_000_000, 0,
            26_075_000, 500_000, 100_000, 26_475_000, 0, 26_475_000
        );

        // Then
        assertEquals(0, result.getTetBonus());
        assertEquals(0, result.getNetBonus());
        assertEquals(result.getNetMonthly(), result.getTotalNetSalary());
    }

    @Test
    @DisplayName("Should verify income components")
    void testIncomeComponents() {
        // Given & When
        long grossSalary = 50_000_000;
        long tetBonus = 10_000_000;
        long totalInsurance = 4_550_000;

        SalaryCalculationResult result = new SalaryCalculationResult(
            grossSalary, 3_744_000, 702_000, 104_000, totalInsurance,
            grossSalary - totalInsurance, tetBonus, 15_400_000, 40_050_000,
            2_400_000, 1_200_000, 1_200_000,
            44_250_000, 500_000, 100_000, 44_650_000, 8_800_000, 53_450_000
        );

        // Then
        assertEquals(grossSalary, result.getGrossSalary());
        assertEquals(tetBonus, result.getTetBonus());
        assertEquals(grossSalary - totalInsurance, result.getIncomeAfterInsurance());
    }

    @Test
    @DisplayName("Should handle large salary values")
    void testLargeSalaryValues() {
        // Given & When
        SalaryCalculationResult result = new SalaryCalculationResult(
            500_000_000, 40_000_000, 7_500_000, 2_500_000, 50_000_000,
            450_000_000, 100_000_000, 24_200_000, 525_800_000,
            80_000_000, 40_000_000, 40_000_000,
            410_000_000, 10_000_000, 5_000_000, 415_000_000, 60_000_000, 475_000_000
        );

        // Then
        assertEquals(500_000_000, result.getGrossSalary());
        assertTrue(result.getNetMonthly() > 0);
        assertTrue(result.getTotalNetSalary() > 0);
    }
}
