package com.personal.money.management.core.tax.application;

import com.personal.money.management.core.tax.domain.model.*;
import com.personal.money.management.core.tax.domain.service.*;
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
 * Unit tests for TaxCalculatorApplicationService
 * Tests the orchestration of domain services for tax calculation use cases
 */
@DisplayName("Tax Calculator Application Service Tests")
class TaxCalculatorApplicationServiceTest {

    @Mock
    private TaxBracketRepository taxBracketRepository;

    @Mock
    private DeductionBracketRepository deductionBracketRepository;

    @Mock
    private WageZoneRepository wageZoneRepository;

    private TaxCalculatorApplicationService applicationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        applicationService = new TaxCalculatorApplicationService(
            taxBracketRepository,
            deductionBracketRepository,
            wageZoneRepository
        );
    }

    private void setupAllMocks() {
        // Setup 7-bracket tax system
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

    @Nested
    @DisplayName("Salary Calculation Service Tests")
    class SalaryCalculationTests {

        @Test
        @DisplayName("Should calculate salary tax from request")
        void testCalculateSalaryTax() {
            // Given
            setupAllMocks();
            
            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(50_000_000);
            request.setTetBonus(10_000_000);
            request.setInsuranceBase(46_800_000);
            request.setDependents(1);
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(11_000_000);
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(500_000);
            request.setOtherDeduction(100_000);
            request.setWageZone("vung-1");
            request.setTaxBracketType("7-bracket");

            // When
            SalaryCalculationResult result = applicationService.calculateSalaryTax(request);

            // Then
            assertNotNull(result);
            assertEquals(50_000_000, result.getGrossSalary());
            assertEquals(10_000_000, result.getTetBonus());
            assertTrue(result.getTotalInsurance() > 0);
            assertTrue(result.getTotalTax() >= 0);
        }

        @Test
        @DisplayName("Should use default insurance base when zero is provided")
        void testDefaultInsuranceBase() {
            // Given
            setupAllMocks();
            
            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(50_000_000);
            request.setTetBonus(0);
            request.setInsuranceBase(0);  // Zero - should use default
            request.setDependents(0);
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(11_000_000);
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(0);
            request.setOtherDeduction(0);
            request.setWageZone("vung-1");
            request.setTaxBracketType("7-bracket");

            // When
            SalaryCalculationResult result = applicationService.calculateSalaryTax(request);

            // Then: Should use default insurance base (46,800,000)
            assertTrue(result.getTotalInsurance() > 0);
            assertNotNull(result);
        }

        @Test
        @DisplayName("Should use default personal deduction when zero is provided")
        void testDefaultPersonalDeduction() {
            // Given
            setupAllMocks();
            
            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(50_000_000);
            request.setTetBonus(0);
            request.setInsuranceBase(46_800_000);
            request.setDependents(0);
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(0);  // Zero - should use default
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(0);
            request.setOtherDeduction(0);
            request.setWageZone("vung-1");
            request.setTaxBracketType("7-bracket");

            // When
            SalaryCalculationResult result = applicationService.calculateSalaryTax(request);

            // Then: Should use default personal deduction (11,000,000)
            assertTrue(result.getTotalDeduction() >= 11_000_000);
            assertNotNull(result);
        }

        @Test
        @DisplayName("Should cap dependents to maximum 10")
        void testDependentsCap() {
            // Given
            setupAllMocks();
            
            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(50_000_000);
            request.setTetBonus(0);
            request.setInsuranceBase(46_800_000);
            request.setDependents(15);  // More than max
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(11_000_000);
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(0);
            request.setOtherDeduction(0);
            request.setWageZone("vung-1");
            request.setTaxBracketType("7-bracket");

            // When
            SalaryCalculationResult result = applicationService.calculateSalaryTax(request);

            // Then: Should cap at 10 dependents
            long maxDependentDeduction = 10 * 4_400_000;
            long totalDeduction = result.getTotalDeduction();
            assertTrue(totalDeduction <= 11_000_000 + maxDependentDeduction);
        }

        @Test
        @DisplayName("Should handle request with no bonus")
        void testCalculationWithoutBonus() {
            // Given
            setupAllMocks();
            
            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(30_000_000);
            request.setTetBonus(0);
            request.setInsuranceBase(46_800_000);
            request.setDependents(0);
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(11_000_000);
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(0);
            request.setOtherDeduction(0);
            request.setWageZone("vung-1");
            request.setTaxBracketType("7-bracket");

            // When
            SalaryCalculationResult result = applicationService.calculateSalaryTax(request);

            // Then
            assertEquals(0, result.getTetBonus());
            assertEquals(0, result.getNetBonus());
            assertTrue(result.getSalaryTax() >= 0);
        }

        @Test
        @DisplayName("Should handle request with large bonus")
        void testCalculationWithLargeBonus() {
            // Given
            setupAllMocks();
            
            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(20_000_000);
            request.setTetBonus(50_000_000);  // Large bonus
            request.setInsuranceBase(46_800_000);
            request.setDependents(0);
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(11_000_000);
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(0);
            request.setOtherDeduction(0);
            request.setWageZone("vung-1");
            request.setTaxBracketType("7-bracket");

            // When
            SalaryCalculationResult result = applicationService.calculateSalaryTax(request);

            // Then: Bonus tax should be calculated
            assertTrue(result.getBonusTax() > 0);
            assertEquals(50_000_000, result.getTetBonus());
        }

        @Test
        @DisplayName("Should handle different tax bracket types")
        void testDifferentTaxBracketTypes() {
            // Given: Setup 5-bracket system as well
            setupAllMocks();
            
            var bracket1 = createBracketDetail(1, 9_000_000L, 5);
            var bracket2 = createBracketDetail(2, 25_000_000L, 10);
            var bracket3 = createBracketDetail(3, 50_000_000L, 15);
            var bracket4 = createBracketDetail(4, 70_000_000L, 20);
            var bracket5 = createBracketDetail(5, Long.MAX_VALUE, 25);

            TaxBracketEntity fiveBracketEntity = new TaxBracketEntity();
            fiveBracketEntity.setValue(TaxBracketType.FIVE_BRACKET.getCode());
            fiveBracketEntity.setDetails(Arrays.asList(bracket1, bracket2, bracket3, bracket4, bracket5));

            when(taxBracketRepository.findByValue(TaxBracketType.FIVE_BRACKET.getCode()))
                .thenReturn(Optional.of(fiveBracketEntity));

            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(50_000_000);
            request.setTetBonus(0);
            request.setInsuranceBase(46_800_000);
            request.setDependents(0);
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(11_000_000);
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(0);
            request.setOtherDeduction(0);
            request.setWageZone("vung-1");
            request.setTaxBracketType("5-bracket");

            // When
            SalaryCalculationResult result = applicationService.calculateSalaryTax(request);

            // Then
            assertNotNull(result);
            assertTrue(result.getTotalTax() >= 0);
        }

        @Test
        @DisplayName("Should handle multiple deductions correctly")
        void testMultipleDeductions() {
            // Given
            setupAllMocks();
            
            long taxFreeAllowance = 2_000_000;
            long otherDeduction = 500_000;
            
            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(50_000_000);
            request.setTetBonus(0);
            request.setInsuranceBase(46_800_000);
            request.setDependents(0);
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(11_000_000);
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(taxFreeAllowance);
            request.setOtherDeduction(otherDeduction);
            request.setWageZone("vung-1");
            request.setTaxBracketType("7-bracket");

            // When
            SalaryCalculationResult result = applicationService.calculateSalaryTax(request);

            // Then
            assertEquals(taxFreeAllowance, result.getTaxFreeAllowance());
            assertEquals(otherDeduction, result.getOtherDeduction());
            assertTrue(result.getNetMonthly() > 0);
        }

        @Test
        @DisplayName("Should verify calculation consistency")
        void testCalculationConsistency() {
            // Given
            setupAllMocks();
            
            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(50_000_000);
            request.setTetBonus(5_000_000);
            request.setInsuranceBase(46_800_000);
            request.setDependents(2);
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(11_000_000);
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(500_000);
            request.setOtherDeduction(0);
            request.setWageZone("vung-1");
            request.setTaxBracketType("7-bracket");

            // When
            SalaryCalculationResult result = applicationService.calculateSalaryTax(request);

            // Then: Verify mathematical consistency
            assertEquals(
                result.getNetMonthly() + result.getNetBonus(),
                result.getTotalNetSalary()
            );
            
            assertEquals(
                result.getSalaryTax() + result.getBonusTax(),
                result.getTotalTax()
            );
            
            assertTrue(result.getTotalNetSalary() <= result.getGrossSalary() + result.getTetBonus());
        }

        @Test
        @DisplayName("Should handle zero salary edge case")
        void testZeroSalary() {
            // Given
            setupAllMocks();
            
            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(0);
            request.setTetBonus(0);
            request.setInsuranceBase(46_800_000);
            request.setDependents(0);
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(11_000_000);
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(0);
            request.setOtherDeduction(0);
            request.setWageZone("vung-1");
            request.setTaxBracketType("7-bracket");

            // When
            SalaryCalculationResult result = applicationService.calculateSalaryTax(request);

            // Then
            assertEquals(0, result.getGrossSalary());
            assertEquals(0, result.getTotalTax());
        }
    }

    @Nested
    @DisplayName("Error Handling Tests")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Should throw exception for invalid wage zone")
        void testInvalidWageZone() {
            // Given
            when(wageZoneRepository.findByValue("invalid-zone")).thenReturn(Optional.empty());

            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(50_000_000);
            request.setTetBonus(0);
            request.setInsuranceBase(46_800_000);
            request.setDependents(0);
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(11_000_000);
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(0);
            request.setOtherDeduction(0);
            request.setWageZone("invalid-zone");
            request.setTaxBracketType("7-bracket");

            // When & Then
            assertThrows(IllegalArgumentException.class, () ->
                applicationService.calculateSalaryTax(request)
            );
        }

        @Test
        @DisplayName("Should throw exception for invalid tax bracket type")
        void testInvalidTaxBracketType() {
            // Given
            setupAllMocks();
            
            when(taxBracketRepository.findByValue("invalid-bracket"))
                .thenReturn(Optional.empty());

            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(50_000_000);
            request.setTetBonus(0);
            request.setInsuranceBase(46_800_000);
            request.setDependents(0);
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(11_000_000);
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(0);
            request.setOtherDeduction(0);
            request.setWageZone("vung-1");
            request.setTaxBracketType("invalid-bracket");

            // When & Then
            assertThrows(IllegalArgumentException.class, () ->
                applicationService.calculateSalaryTax(request)
            );
        }
    }

    @Nested
    @DisplayName("Real-world Scenario Tests")
    class RealWorldScenarioTests {

        @Test
        @DisplayName("Should calculate tax for typical Vietnamese salary")
        void testTypicalVietnameseSalary() {
            // Given: Typical salary scenario
            setupAllMocks();
            
            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(25_000_000);  // 25M VND
            request.setTetBonus(5_000_000);      // 5M VND bonus
            request.setInsuranceBase(46_800_000);
            request.setDependents(1);
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(11_000_000);
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(0);
            request.setOtherDeduction(0);
            request.setWageZone("vung-1");
            request.setTaxBracketType("7-bracket");

            // When
            SalaryCalculationResult result = applicationService.calculateSalaryTax(request);

            // Then
            assertNotNull(result);
            assertTrue(result.getNetMonthly() > 0);
            assertTrue(result.getTotalNetSalary() > 0);
            assertEquals(5_000_000, result.getTetBonus());
        }

        @Test
        @DisplayName("Should calculate tax for high-income earner")
        void testHighIncomeEarner() {
            // Given: High income scenario
            setupAllMocks();
            
            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(100_000_000);  // 100M VND
            request.setTetBonus(50_000_000);       // 50M VND bonus
            request.setInsuranceBase(46_800_000);
            request.setDependents(2);
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(11_000_000);
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(3_000_000);
            request.setOtherDeduction(1_000_000);
            request.setWageZone("vung-1");
            request.setTaxBracketType("7-bracket");

            // When
            SalaryCalculationResult result = applicationService.calculateSalaryTax(request);

            // Then
            assertTrue(result.getTotalTax() > 0);
            assertTrue(result.getNetMonthly() > 0);
            // High income should result in higher tax
            assertTrue(result.getTotalTax() > 5_000_000);
        }

        @Test
        @DisplayName("Should calculate tax for low-income earner")
        void testLowIncomeEarner() {
            // Given: Low income scenario
            setupAllMocks();
            
            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(8_000_000);    // 8M VND (below minimum wage)
            request.setTetBonus(0);
            request.setInsuranceBase(46_800_000);
            request.setDependents(0);
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(11_000_000);
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(0);
            request.setOtherDeduction(0);
            request.setWageZone("vung-1");
            request.setTaxBracketType("7-bracket");

            // When
            SalaryCalculationResult result = applicationService.calculateSalaryTax(request);

            // Then: Low income likely results in zero tax after deductions
            assertEquals(0, result.getTotalTax());
            assertTrue(result.getNetMonthly() > 0);
        }
    }
}
