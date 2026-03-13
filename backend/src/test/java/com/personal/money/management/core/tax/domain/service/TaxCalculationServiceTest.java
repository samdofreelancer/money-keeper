package com.personal.money.management.core.tax.domain.service;

import com.personal.money.management.core.tax.domain.model.*;
import com.personal.money.management.core.tax.infrastructure.persistence.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TaxCalculationService - Core domain service for tax calculations
 * Tests Vietnam's personal income tax rules including:
 * - Progressive tax calculation
 * - Insurance contributions
 * - Deductions
 * - Complete salary calculation
 */
@DisplayName("Tax Calculation Service Tests")
class TaxCalculationServiceTest {

    @Mock
    private TaxBracketRepository taxBracketRepository;

    @Mock
    private DeductionBracketRepository deductionBracketRepository;

    @Mock
    private WageZoneRepository wageZoneRepository;

    private TaxCalculationService taxCalculationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        taxCalculationService = new TaxCalculationService(
            taxBracketRepository,
            deductionBracketRepository,
            wageZoneRepository
        );
    }

    @Nested
    @DisplayName("Progressive Tax Calculation Tests")
    class ProgressiveTaxCalculationTests {

        private TaxBracketEntity setupMockTaxBrackets(TaxBracketType type) {
            // Setup 7-bracket tax structure for Vietnam
            var bracket1 = createBracketDetail(1, 5_000_000L, 5);
            var bracket2 = createBracketDetail(2, 10_000_000L, 10);
            var bracket3 = createBracketDetail(3, 18_000_000L, 15);
            var bracket4 = createBracketDetail(4, 32_000_000L, 20);
            var bracket5 = createBracketDetail(5, 52_000_000L, 25);
            var bracket6 = createBracketDetail(6, 80_000_000L, 30);
            var bracket7 = createBracketDetail(7, Long.MAX_VALUE, 35);

            TaxBracketEntity entity = new TaxBracketEntity();
            entity.setValue(type.getCode());
            entity.setDetails(Arrays.asList(bracket1, bracket2, bracket3, bracket4, bracket5, bracket6, bracket7));

            when(taxBracketRepository.findByValue(type.getCode())).thenReturn(Optional.of(entity));
            return entity;
        }

        private TaxBracketDetailEntity createBracketDetail(Integer order, Long maxIncome, Integer rate) {
            TaxBracketDetailEntity detail = new TaxBracketDetailEntity();
            detail.setBracketOrder(order);
            detail.setMaxIncome(maxIncome);
            detail.setRate((double) rate);
            return detail;
        }

        @Test
        @DisplayName("Should calculate zero tax for zero income")
        void testZeroTaxForZeroIncome() {
            // Given
            setupMockTaxBrackets(TaxBracketType.SEVEN_BRACKET);

            // When
            long tax = taxCalculationService.calculateProgressiveTax(0, TaxBracketType.SEVEN_BRACKET);

            // Then
            assertEquals(0, tax);
        }

        @Test
        @DisplayName("Should calculate zero tax for negative income")
        void testZeroTaxForNegativeIncome() {
            // Given
            setupMockTaxBrackets(TaxBracketType.SEVEN_BRACKET);

            // When
            long tax = taxCalculationService.calculateProgressiveTax(-1_000_000, TaxBracketType.SEVEN_BRACKET);

            // Then
            assertEquals(0, tax);
        }

        @Test
        @DisplayName("Should calculate tax for income in first bracket")
        void testTaxForFirstBracketIncome() {
            // Given: Income of 3,000,000 (below first bracket threshold of 5,000,000)
            setupMockTaxBrackets(TaxBracketType.SEVEN_BRACKET);

            // When
            long tax = taxCalculationService.calculateProgressiveTax(3_000_000, TaxBracketType.SEVEN_BRACKET);

            // Then: 3,000,000 × 5% = 150,000
            assertEquals(150_000, tax);
        }

        @Test
        @DisplayName("Should calculate progressive tax across multiple brackets")
        void testProgressiveTaxAcrossMultipleBrackets() {
            // Given: Income of 12,000,000
            setupMockTaxBrackets(TaxBracketType.SEVEN_BRACKET);

            // When
            long tax = taxCalculationService.calculateProgressiveTax(12_000_000, TaxBracketType.SEVEN_BRACKET);

            // Then:
            // Bracket 1: (5,000,000 - 0) × 5% = 250,000
            // Bracket 2: (10,000,000 - 5,000,000) × 10% = 500,000
            // Bracket 3: (12,000,000 - 10,000,000) × 15% = 300,000
            // Total = 1,050,000
            assertEquals(1_050_000, tax);
        }

        @Test
        @DisplayName("Should calculate tax for high income in top bracket")
        void testTaxForHighIncomeInTopBracket() {
            // Given: Income of 150,000,000 (high bracket)
            setupMockTaxBrackets(TaxBracketType.SEVEN_BRACKET);

            // When
            long tax = taxCalculationService.calculateProgressiveTax(150_000_000, TaxBracketType.SEVEN_BRACKET);

            // Then: Verify tax is calculated correctly with rounding
            assertTrue(tax > 0);
            // Tax should be progressive: higher brackets have higher rates
            assertTrue(tax < 150_000_000); // Tax should be less than income
        }

        @Test
        @DisplayName("Should throw exception for non-existent tax bracket type")
        void testExceptionForNonExistentBracketType() {
            // Given
            when(taxBracketRepository.findByValue("invalid-bracket")).thenReturn(Optional.empty());

            // When & Then
            assertThrows(IllegalArgumentException.class, () ->
                taxCalculationService.calculateProgressiveTax(10_000_000, TaxBracketType.SEVEN_BRACKET)
            );
        }

        @Test
        @DisplayName("Should throw exception when bracket details are empty")
        void testExceptionForEmptyBracketDetails() {
            // Given
            TaxBracketEntity entity = new TaxBracketEntity();
            entity.setValue(TaxBracketType.SEVEN_BRACKET.getCode());
            entity.setDetails(new ArrayList<>());

            when(taxBracketRepository.findByValue(TaxBracketType.SEVEN_BRACKET.getCode()))
                .thenReturn(Optional.of(entity));

            // When & Then
            assertThrows(IllegalArgumentException.class, () ->
                taxCalculationService.calculateProgressiveTax(10_000_000, TaxBracketType.SEVEN_BRACKET)
            );
        }

        @Test
        @DisplayName("Should use 5-bracket system when specified")
        void testFiveBracketSystem() {
            // Given: Setup 5-bracket system
            var bracket1 = createBracketDetail(1, 9_000_000L, 5);
            var bracket2 = createBracketDetail(2, 25_000_000L, 10);
            var bracket3 = createBracketDetail(3, 50_000_000L, 15);
            var bracket4 = createBracketDetail(4, 70_000_000L, 20);
            var bracket5 = createBracketDetail(5, Long.MAX_VALUE, 25);

            TaxBracketEntity entity = new TaxBracketEntity();
            entity.setValue(TaxBracketType.FIVE_BRACKET.getCode());
            entity.setDetails(Arrays.asList(bracket1, bracket2, bracket3, bracket4, bracket5));

            when(taxBracketRepository.findByValue(TaxBracketType.FIVE_BRACKET.getCode()))
                .thenReturn(Optional.of(entity));

            // When
            long tax = taxCalculationService.calculateProgressiveTax(30_000_000, TaxBracketType.FIVE_BRACKET);

            // Then
            assertTrue(tax > 0);
            verify(taxBracketRepository).findByValue(TaxBracketType.FIVE_BRACKET.getCode());
        }
    }

    @Nested
    @DisplayName("Insurance Calculation Tests")
    class InsuranceCalculationTests {

        private WageZoneValue setupWageZone() {
            WageZoneEntity entity = new WageZoneEntity();
            entity.setValue("vung-1");
            entity.setLabel("Vùng 1");
            entity.setMinimumWage(7_333_000L);
            entity.setInsuranceCap(20_790_000L);

            when(wageZoneRepository.findByValue("vung-1")).thenReturn(Optional.of(entity));
            return new WageZoneValue("vung-1", "Vùng 1", 7_333_000L, 20_790_000L);
        }

        @Test
        @DisplayName("Should calculate BHXH, BHYT, BHTN correctly")
        void testInsuranceBreakdown() {
            // Given
            setupWageZone();
            WageZoneValue wageZone = new WageZoneValue("vung-1", "Vùng 1", 7_333_000L, 20_790_000L);
            
            SalaryCalculationInput input = new SalaryCalculationInput(
                50_000_000,    // gross salary
                0,             // tet bonus
                46_800_000,    // insurance base
                0,             // dependents
                8.0,           // bhxh rate
                1.5,           // bhyt rate
                0.5,           // bhtn rate
                11_000_000,    // personal deduction
                4_400_000,     // dependent deduction
                0,             // tax free allowance
                0,             // other deduction
                TaxBracketType.SEVEN_BRACKET,
                wageZone
            );

            // When
            InsuranceBreakdown breakdown = taxCalculationService.calculateInsurance(input);

            // Then
            long expectedBhxh = Math.round(46_800_000 * 8.0 / 100);  // 3,744,000
            long expectedBhyt = Math.round(46_800_000 * 1.5 / 100);   // 702,000
            long expectedBhtn = Math.round(Math.min(50_000_000, 20_790_000) * 0.5 / 100); // 103,950

            assertEquals(expectedBhxh, breakdown.getBhxh());
            assertEquals(expectedBhyt, breakdown.getBhyt());
            assertEquals(expectedBhtn, breakdown.getBhtn());
            assertEquals(expectedBhxh + expectedBhyt + expectedBhtn, breakdown.getTotalInsurance());
        }

        @Test
        @DisplayName("Should cap BHTN using insurance cap from wage zone")
        void testBhtnCappedByWageZone() {
            // Given: Salary higher than insurance cap
            setupWageZone();
            WageZoneValue wageZone = new WageZoneValue("vung-1", "Vùng 1", 7_333_000L, 20_790_000L);
            
            SalaryCalculationInput input = new SalaryCalculationInput(
                100_000_000,   // gross salary (higher than cap)
                0,
                50_000_000,
                0,
                8.0,
                1.5,
                0.5,
                11_000_000,
                4_400_000,
                0,
                0,
                TaxBracketType.SEVEN_BRACKET,
                wageZone
            );

            // When
            InsuranceBreakdown breakdown = taxCalculationService.calculateInsurance(input);

            // Then: BHTN should be based on cap (20,790,000), not full salary
            long expectedBhtn = Math.round(20_790_000 * 0.5 / 100);
            assertEquals(expectedBhtn, breakdown.getBhtn());
        }
    }

    @Nested
    @DisplayName("Complete Salary Calculation Tests")
    class CompleteSalaryCalculationTests {

        private void setupAllMocks() {
            // Setup tax brackets
            var bracket1 = createBracketDetail(1, 5_000_000L, 5);
            var bracket2 = createBracketDetail(2, 10_000_000L, 10);
            var bracket3 = createBracketDetail(3, 18_000_000L, 15);
            var bracket4 = createBracketDetail(4, 32_000_000L, 20);
            var bracket5 = createBracketDetail(5, 52_000_000L, 25);
            var bracket6 = createBracketDetail(6, 80_000_000L, 30);
            var bracket7 = createBracketDetail(7, Long.MAX_VALUE, 35);

            TaxBracketEntity taxEntity = new TaxBracketEntity();
            taxEntity.setValue(TaxBracketType.SEVEN_BRACKET.getCode());
            taxEntity.setDetails(Arrays.asList(bracket1, bracket2, bracket3, bracket4, bracket5, bracket6, bracket7));

            when(taxBracketRepository.findByValue(TaxBracketType.SEVEN_BRACKET.getCode()))
                .thenReturn(Optional.of(taxEntity));

            // Setup wage zone
            WageZoneEntity wageEntity = new WageZoneEntity();
            wageEntity.setValue("vung-1");
            wageEntity.setLabel("Vùng 1");
            wageEntity.setMinimumWage(7_333_000L);
            wageEntity.setInsuranceCap(20_790_000L);

            when(wageZoneRepository.findByValue("vung-1")).thenReturn(Optional.of(wageEntity));
        }

        private TaxBracketDetailEntity createBracketDetail(Integer order, Long maxIncome, Integer rate) {
            TaxBracketDetailEntity detail = new TaxBracketDetailEntity();
            detail.setBracketOrder(order);
            detail.setMaxIncome(maxIncome);
            detail.setRate((double) rate);
            return detail;
        }

        @Test
        @DisplayName("Should calculate complete salary with all components")
        void testCompleteSalaryCalculation() {
            // Given
            setupAllMocks();
            WageZoneValue wageZone = new WageZoneValue("vung-1", "Vùng 1", 7_333_000L, 20_790_000L);
            
            SalaryCalculationInput input = new SalaryCalculationInput(
                50_000_000,    // gross salary
                10_000_000,    // tet bonus
                46_800_000,    // insurance base
                1,             // 1 dependent
                8.0,           // bhxh rate
                1.5,           // bhyt rate
                0.5,           // bhtn rate
                11_000_000,    // personal deduction
                4_400_000,     // dependent deduction
                500_000,       // tax free allowance
                100_000,       // other deduction
                TaxBracketType.SEVEN_BRACKET,
                wageZone
            );

            // When
            SalaryCalculationResult result = taxCalculationService.calculateSalary(input);

            // Then
            assertEquals(50_000_000, result.getGrossSalary());
            assertEquals(10_000_000, result.getTetBonus());
            assertTrue(result.getTotalInsurance() > 0);
            assertTrue(result.getTotalTax() >= 0);
            assertTrue(result.getNetMonthly() > 0);
            assertEquals(500_000, result.getTaxFreeAllowance());
            assertEquals(100_000, result.getOtherDeduction());
        }

        @Test
        @DisplayName("Should correctly calculate deductions with dependents")
        void testDeductionWithDependents() {
            // Given
            setupAllMocks();
            WageZoneValue wageZone = new WageZoneValue("vung-1", "Vùng 1", 7_333_000L, 20_790_000L);
            
            SalaryCalculationInput input = new SalaryCalculationInput(
                50_000_000,
                0,
                46_800_000,
                3,  // 3 dependents
                8.0,
                1.5,
                0.5,
                11_000_000,
                4_400_000,
                0,
                0,
                TaxBracketType.SEVEN_BRACKET,
                wageZone
            );

            // When
            SalaryCalculationResult result = taxCalculationService.calculateSalary(input);

            // Then: Total deduction = 11,000,000 + (3 × 4,400,000) = 24,200,000
            long expectedTotalDeduction = 11_000_000 + (3 * 4_400_000);
            assertEquals(expectedTotalDeduction, result.getTotalDeduction());
        }

        @Test
        @DisplayName("Should handle zero taxable income correctly")
        void testZeroTaxableIncome() {
            // Given: Very low salary that results in zero taxable income after deductions
            setupAllMocks();
            WageZoneValue wageZone = new WageZoneValue("vung-1", "Vùng 1", 7_333_000L, 20_790_000L);
            
            SalaryCalculationInput input = new SalaryCalculationInput(
                10_000_000,    // low salary
                0,
                46_800_000,
                0,
                8.0,
                1.5,
                0.5,
                11_000_000,    // high personal deduction
                4_400_000,
                0,
                0,
                TaxBracketType.SEVEN_BRACKET,
                wageZone
            );

            // When
            SalaryCalculationResult result = taxCalculationService.calculateSalary(input);

            // Then
            assertEquals(0, result.getTotalTax());
        }

        @Test
        @DisplayName("Should correctly calculate tax on bonus separately")
        void testBonusTaxCalculation() {
            // Given
            setupAllMocks();
            WageZoneValue wageZone = new WageZoneValue("vung-1", "Vùng 1", 7_333_000L, 20_790_000L);
            
            SalaryCalculationInput input = new SalaryCalculationInput(
                20_000_000,
                20_000_000,    // large bonus
                46_800_000,
                0,
                8.0,
                1.5,
                0.5,
                11_000_000,
                4_400_000,
                0,
                0,
                TaxBracketType.SEVEN_BRACKET,
                wageZone
            );

            // When
            SalaryCalculationResult result = taxCalculationService.calculateSalary(input);

            // Then
            assertTrue(result.getBonusTax() > 0);
            assertTrue(result.getSalaryTax() > 0);
            assertEquals(result.getSalaryTax() + result.getBonusTax(), result.getTotalTax());
        }

        @Test
        @DisplayName("Should apply tax free allowance correctly")
        void testTaxFreeAllowanceApplication() {
            // Given
            setupAllMocks();
            WageZoneValue wageZone = new WageZoneValue("vung-1", "Vùng 1", 7_333_000L, 20_790_000L);
            
            long taxFreeAllowance = 5_000_000;
            SalaryCalculationInput input = new SalaryCalculationInput(
                40_000_000,
                0,
                46_800_000,
                0,
                8.0,
                1.5,
                0.5,
                11_000_000,
                4_400_000,
                taxFreeAllowance,
                0,
                TaxBracketType.SEVEN_BRACKET,
                wageZone
            );

            // When
            SalaryCalculationResult result = taxCalculationService.calculateSalary(input);

            // Then: Net monthly should include tax free allowance
            assertTrue(result.getNetMonthly() > 0);
            assertEquals(taxFreeAllowance, result.getTaxFreeAllowance());
        }

        @Test
        @DisplayName("Should calculate net salary correctly")
        void testNetSalaryCalculation() {
            // Given
            setupAllMocks();
            WageZoneValue wageZone = new WageZoneValue("vung-1", "Vùng 1", 7_333_000L, 20_790_000L);
            
            SalaryCalculationInput input = new SalaryCalculationInput(
                50_000_000,
                5_000_000,
                46_800_000,
                0,
                8.0,
                1.5,
                0.5,
                11_000_000,
                4_400_000,
                0,
                0,
                TaxBracketType.SEVEN_BRACKET,
                wageZone
            );

            // When
            SalaryCalculationResult result = taxCalculationService.calculateSalary(input);

            // Then
            assertEquals(
                result.getNetMonthly() + result.getNetBonus(),
                result.getTotalNetSalary()
            );
            assertTrue(result.getTotalNetSalary() < result.getGrossSalary() + result.getTetBonus());
        }
    }

    @Nested
    @DisplayName("Deduction Bracket Retrieval Tests")
    class DeductionBracketTests {

        @Test
        @DisplayName("Should retrieve deduction bracket for given date")
        void testGetDeductionBracket() {
            // Given
            LocalDate testDate = LocalDate.of(2024, 1, 1);
            DeductionBracketEntity entity = new DeductionBracketEntity();
            entity.setValue("2024");
            entity.setLabel("2024 Deduction");
            entity.setPersonalDeduction(11_000_000L);
            entity.setDependentDeduction(4_400_000L);
            entity.setEffectiveDate(LocalDate.of(2024, 1, 1));

            when(deductionBracketRepository.findLatestEffectiveByDate(testDate))
                .thenReturn(Arrays.asList(entity));

            // When
            DeductionBracketValue result = taxCalculationService.getDeductionBracket(testDate);

            // Then
            assertEquals("2024", result.getValue());
            assertEquals(11_000_000L, result.getPersonalDeduction());
            assertEquals(4_400_000L, result.getDependentDeduction());
        }

        @Test
        @DisplayName("Should throw exception when deduction bracket not found")
        void testExceptionWhenDeductionBracketNotFound() {
            // Given
            LocalDate testDate = LocalDate.of(1900, 1, 1);
            when(deductionBracketRepository.findLatestEffectiveByDate(testDate))
                .thenReturn(new ArrayList<>());

            // When & Then
            assertThrows(IllegalArgumentException.class, () ->
                taxCalculationService.getDeductionBracket(testDate)
            );
        }
    }

    @Nested
    @DisplayName("Wage Zone Retrieval Tests")
    class WageZoneTests {

        @Test
        @DisplayName("Should retrieve wage zone by value")
        void testGetWageZone() {
            // Given
            WageZoneEntity entity = new WageZoneEntity();
            entity.setValue("vung-1");
            entity.setLabel("Vùng 1");
            entity.setMinimumWage(7_333_000L);
            entity.setInsuranceCap(20_790_000L);

            when(wageZoneRepository.findByValue("vung-1")).thenReturn(Optional.of(entity));

            // When
            WageZoneValue result = taxCalculationService.getWageZone("vung-1");

            // Then
            assertEquals("vung-1", result.getValue());
            assertEquals("Vùng 1", result.getLabel());
            assertEquals(7_333_000L, result.getMinimumWage());
            assertEquals(20_790_000L, result.getInsuranceCap());
        }

        @Test
        @DisplayName("Should throw exception when wage zone not found")
        void testExceptionWhenWageZoneNotFound() {
            // Given
            when(wageZoneRepository.findByValue("invalid")).thenReturn(Optional.empty());

            // When & Then
            assertThrows(IllegalArgumentException.class, () ->
                taxCalculationService.getWageZone("invalid")
            );
        }
    }
}
