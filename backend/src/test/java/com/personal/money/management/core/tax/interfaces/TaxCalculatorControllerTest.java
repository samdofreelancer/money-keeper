package com.personal.money.management.core.tax.interfaces;

import com.personal.money.management.core.tax.application.SalaryCalculationRequest;
import com.personal.money.management.core.tax.application.SalaryCalculationResponse;
import com.personal.money.management.core.tax.application.TaxCalculatorApplicationService;
import com.personal.money.management.core.tax.application.TaxConfigService;
import com.personal.money.management.core.tax.domain.model.SalaryCalculationResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TaxCalculatorController
 * Tests HTTP endpoint handling and response mapping
 */
@DisplayName("Tax Calculator Controller Tests")
class TaxCalculatorControllerTest {

    @Mock
    private TaxCalculatorApplicationService taxCalculatorApplicationService;

    @Mock
    private TaxConfigService taxConfigService;

    private TaxCalculatorController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        controller = new TaxCalculatorController(taxCalculatorApplicationService, taxConfigService);
    }

    @Nested
    @DisplayName("Salary Tax Calculation Endpoint Tests")
    class CalculateSalaryTaxTests {

        @Test
        @DisplayName("Should calculate salary tax and return 200 OK")
        void testCalculateSalaryTax() {
            // Given
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

            SalaryCalculationResult mockResult = new SalaryCalculationResult(
                50_000_000, 3_744_000, 702_000, 104_000, 4_550_000,
                45_450_000, 10_000_000, 15_400_000, 40_050_000,
                2_400_000, 1_200_000, 1_200_000,
                44_250_000, 500_000, 100_000, 44_650_000, 8_800_000, 53_450_000
            );

            when(taxCalculatorApplicationService.calculateSalaryTax(request))
                .thenReturn(mockResult);

            // When
            ResponseEntity<SalaryCalculationResponse> response = 
                controller.calculateSalaryTax(request);

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            SalaryCalculationResponse body = response.getBody();
            assertNotNull(body);
            assertEquals(50_000_000, body.getGrossSalary());
            assertEquals(10_000_000, body.getTetBonus());
            assertEquals(2_400_000, body.getTotalTax());
            verify(taxCalculatorApplicationService).calculateSalaryTax(request);
        }

        @Test
        @DisplayName("Should map all calculation result fields to response")
        void testResponseMappingComplete() {
            // Given
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

            SalaryCalculationResult mockResult = new SalaryCalculationResult(
                50_000_000, 3_744_000, 702_000, 104_000, 4_550_000,
                45_450_000, 10_000_000, 15_400_000, 40_050_000,
                2_400_000, 1_200_000, 1_200_000,
                44_250_000, 500_000, 100_000, 44_650_000, 8_800_000, 53_450_000
            );

            when(taxCalculatorApplicationService.calculateSalaryTax(request))
                .thenReturn(mockResult);

            // When
            ResponseEntity<SalaryCalculationResponse> response = 
                controller.calculateSalaryTax(request);

            // Then: Verify all fields are correctly mapped
            SalaryCalculationResponse body = response.getBody();
            assertNotNull(body);
            assertEquals(3_744_000, body.getBhxh());
            assertEquals(702_000, body.getBhyt());
            assertEquals(104_000, body.getBhtn());
            assertEquals(4_550_000, body.getTotalInsurance());
            assertEquals(45_450_000, body.getIncomeAfterInsurance());
            assertEquals(15_400_000, body.getTotalDeduction());
            assertEquals(40_050_000, body.getTaxableIncome());
            assertEquals(2_400_000, body.getTotalTax());
            assertEquals(1_200_000, body.getSalaryTax());
            assertEquals(1_200_000, body.getBonusTax());
            assertEquals(44_250_000, body.getNetBeforeAllowance());
            assertEquals(500_000, body.getTaxFreeAllowance());
            assertEquals(100_000, body.getOtherDeduction());
            assertEquals(44_650_000, body.getNetMonthly());
            assertEquals(8_800_000, body.getNetBonus());
            assertEquals(53_450_000, body.getTotalNetSalary());
        }

        @Test
        @DisplayName("Should handle zero salary request")
        void testZeroSalaryRequest() {
            // Given
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

            SalaryCalculationResult mockResult = new SalaryCalculationResult(
                0, 0, 0, 0, 0, 0, 0, 11_000_000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            );

            when(taxCalculatorApplicationService.calculateSalaryTax(request))
                .thenReturn(mockResult);

            // When
            ResponseEntity<SalaryCalculationResponse> response = 
                controller.calculateSalaryTax(request);

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            SalaryCalculationResponse body = response.getBody();
            assertNotNull(body);
            assertEquals(0, body.getTotalTax());
        }

        @Test
        @DisplayName("Should handle high income request")
        void testHighIncomeRequest() {
            // Given
            SalaryCalculationRequest request = new SalaryCalculationRequest();
            request.setGrossSalary(200_000_000);
            request.setTetBonus(100_000_000);
            request.setInsuranceBase(46_800_000);
            request.setDependents(3);
            request.setBhxhRate(8.0);
            request.setBhytRate(1.5);
            request.setBhtnRate(0.5);
            request.setPersonalDeduction(11_000_000);
            request.setDependentDeductionPerPerson(4_400_000);
            request.setTaxFreeAllowance(5_000_000);
            request.setOtherDeduction(2_000_000);
            request.setWageZone("vung-1");
            request.setTaxBracketType("7-bracket");

            SalaryCalculationResult mockResult = new SalaryCalculationResult(
                200_000_000, 8_000_000, 1_500_000, 500_000, 10_000_000,
                190_000_000, 100_000_000, 24_200_000, 265_800_000,
                50_000_000, 25_000_000, 25_000_000,
                165_000_000, 5_000_000, 2_000_000, 168_000_000, 75_000_000, 243_000_000
            );

            when(taxCalculatorApplicationService.calculateSalaryTax(request))
                .thenReturn(mockResult);

            // When
            ResponseEntity<SalaryCalculationResponse> response = 
                controller.calculateSalaryTax(request);

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            SalaryCalculationResponse body = response.getBody();
            assertNotNull(body);
            assertTrue(body.getTotalTax() > 0);
            assertEquals(243_000_000, body.getTotalNetSalary());
        }
    }

    @Nested
    @DisplayName("Get Tax Config Endpoint Tests")
    class GetTaxConfigTests {

        @Test
        @DisplayName("Should retrieve tax configuration successfully")
        void testGetTaxConfig() {
            // Given
            TaxConfigResponse mockConfig = new TaxConfigResponse(
                new ArrayList<>(),
                new ArrayList<>(),
                new ArrayList<>()
            );

            when(taxConfigService.getTaxConfig()).thenReturn(mockConfig);

            // When
            ResponseEntity<TaxConfigResponse> response = controller.getTaxConfig();

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            verify(taxConfigService).getTaxConfig();
        }
    }

    @Nested
    @DisplayName("Health Check Endpoint Tests")
    class HealthCheckTests {

        @Test
        @DisplayName("Should return health check message")
        void testHealth() {
            // When
            ResponseEntity<String> response = controller.health();

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals("Tax Calculator Service is running", response.getBody());
        }

        @Test
        @DisplayName("Should always return 200 status")
        void testHealthStatusCode() {
            // When
            ResponseEntity<String> response = controller.health();

            // Then
            assertTrue(response.getStatusCode().is2xxSuccessful());
        }
    }
}
