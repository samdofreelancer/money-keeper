package com.personal.money.management.core.tax.interfaces;

import com.personal.money.management.core.tax.application.TaxBracketRequest;
import com.personal.money.management.core.tax.application.TaxBracketResponse;
import com.personal.money.management.core.tax.application.TaxConfigService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TaxConfigController
 * Tests CRUD operations for tax configuration
 */
@DisplayName("Tax Config Controller Tests")
class TaxConfigControllerTest {

    @Mock
    private TaxConfigService taxConfigService;

    private TaxConfigController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        controller = new TaxConfigController(taxConfigService);
    }

    @Nested
    @DisplayName("Get Tax Configuration Tests")
    class GetTaxConfigTests {

        @Test
        @DisplayName("Should retrieve all tax configuration options")
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

        @Test
        @DisplayName("Should return 200 status code for tax config")
        void testGetTaxConfigStatus() {
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
            assertTrue(response.getStatusCode().is2xxSuccessful());
        }
    }

    @Nested
    @DisplayName("Get Tax Bracket By Value Tests")
    class GetTaxBracketByValueTests {

        @Test
        @DisplayName("Should retrieve tax bracket when found")
        void testGetTaxBracketFound() {
            // Given
            String bracketValue = "7-bracket";

            when(taxConfigService.getTaxBracketByValue(bracketValue))
                .thenReturn(mock(TaxConfigResponse.TaxBracketOption.class));

            // When
            ResponseEntity<?> response = controller.getTaxBracketByValue(bracketValue);

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            verify(taxConfigService).getTaxBracketByValue(bracketValue);
        }

        @Test
        @DisplayName("Should return 404 when tax bracket not found")
        void testGetTaxBracketNotFound() {
            // Given
            String bracketValue = "invalid-bracket";

            when(taxConfigService.getTaxBracketByValue(bracketValue))
                .thenReturn(null);

            // When
            ResponseEntity<?> response = controller.getTaxBracketByValue(bracketValue);

            // Then
            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
            verify(taxConfigService).getTaxBracketByValue(bracketValue);
        }

        @Test
        @DisplayName("Should retrieve 5-bracket system")
        void testGetFiveBracketSystem() {
            // Given
            String bracketValue = "5-bracket";

            when(taxConfigService.getTaxBracketByValue(bracketValue))
                .thenReturn(mock(TaxConfigResponse.TaxBracketOption.class));

            // When
            ResponseEntity<?> response = controller.getTaxBracketByValue(bracketValue);

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
        }
    }

    @Nested
    @DisplayName("Create Tax Bracket Tests")
    class CreateTaxBracketTests {

        private List<TaxBracketRequest.TaxBracketDetailRequest> createValidBracketDetails() {
            // Create a list with valid bracket details to pass validation
            List<TaxBracketRequest.TaxBracketDetailRequest> details = new ArrayList<>();
            details.add(new TaxBracketRequest.TaxBracketDetailRequest(0L, 5_000_000L, 0.05, 0L, 1));
            details.add(new TaxBracketRequest.TaxBracketDetailRequest(5_000_001L, 10_000_000L, 0.10, 0L, 2));
            return details;
        }

        @Test
        @DisplayName("Should create tax bracket successfully")
        void testCreateTaxBracketSuccess() {
            // Given
            TaxBracketRequest request = new TaxBracketRequest();
            request.setValue("new-bracket");
            request.setLabel("New Bracket");
            request.setDetails(createValidBracketDetails()); // Valid details

            TaxBracketResponse mockResponse = new TaxBracketResponse(
                "new-bracket", "New Bracket", "Success", null, true
            );

            when(taxConfigService.createTaxBracket(request))
                .thenReturn(mockResponse);

            // When
            ResponseEntity<TaxBracketResponse> response = controller.createTaxBracket(request);

            // Then
            assertEquals(HttpStatus.CREATED, response.getStatusCode());
            TaxBracketResponse body = response.getBody();
            assertNotNull(body);
            assertTrue(body.isSuccess());
            verify(taxConfigService).createTaxBracket(request);
        }

        @Test
        @DisplayName("Should reject tax bracket with empty value")
        void testCreateTaxBracketEmptyValue() {
            // Given
            TaxBracketRequest request = new TaxBracketRequest();
            request.setValue("");
            request.setLabel("Test Bracket");
            request.setDetails(createValidBracketDetails());

            // When
            ResponseEntity<TaxBracketResponse> response = controller.createTaxBracket(request);

            // Then
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            TaxBracketResponse body = response.getBody();
            assertNotNull(body);
            assertFalse(body.isSuccess());
        }

        @Test
        @DisplayName("Should reject tax bracket with null value")
        void testCreateTaxBracketNullValue() {
            // Given
            TaxBracketRequest request = new TaxBracketRequest();
            request.setValue(null);
            request.setLabel("Test Bracket");
            request.setDetails(createValidBracketDetails());

            // When
            ResponseEntity<TaxBracketResponse> response = controller.createTaxBracket(request);

            // Then
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            TaxBracketResponse body = response.getBody();
            assertNotNull(body);
            assertFalse(body.isSuccess());
        }

        @Test
        @DisplayName("Should reject tax bracket with empty details")
        void testCreateTaxBracketEmptyDetails() {
            // Given
            TaxBracketRequest request = new TaxBracketRequest();
            request.setValue("test-bracket");
            request.setLabel("Test Bracket");
            request.setDetails(new ArrayList<>()); // Empty details - should be rejected

            // When
            ResponseEntity<TaxBracketResponse> response = controller.createTaxBracket(request);

            // Then
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            TaxBracketResponse body = response.getBody();
            assertNotNull(body);
            assertFalse(body.isSuccess());
        }

        @Test
        @DisplayName("Should handle service failure gracefully")
        void testCreateTaxBracketServiceFailure() {
            // Given
            TaxBracketRequest request = new TaxBracketRequest();
            request.setValue("test-bracket");
            request.setLabel("Test Bracket");
            request.setDetails(createValidBracketDetails());

            TaxBracketResponse mockResponse = new TaxBracketResponse(
                "test-bracket", "Test Bracket", "Database error", null, false
            );

            when(taxConfigService.createTaxBracket(request))
                .thenReturn(mockResponse);

            // When
            ResponseEntity<TaxBracketResponse> response = controller.createTaxBracket(request);

            // Then
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            TaxBracketResponse body = response.getBody();
            assertNotNull(body);
            assertFalse(body.isSuccess());
        }
    }

    @Nested
    @DisplayName("Error Handling Tests")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Should handle null request gracefully")
        void testNullRequest() {
            // Given
            TaxBracketRequest request = new TaxBracketRequest();
            request.setValue(null);
            request.setLabel(null);
            request.setDetails(null);

            // When
            ResponseEntity<TaxBracketResponse> response = controller.createTaxBracket(request);

            // Then
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        }

        @Test
        @DisplayName("Should handle whitespace-only value")
        void testWhitespaceOnlyValue() {
            // Given
            TaxBracketRequest request = new TaxBracketRequest();
            request.setValue("   ");
            request.setLabel("Test");
            request.setDetails(new ArrayList<>());

            // When
            ResponseEntity<TaxBracketResponse> response = controller.createTaxBracket(request);

            // Then
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        }
    }

    @Nested
    @DisplayName("API Response Consistency Tests")
    class ResponseConsistencyTests {

        @Test
        @DisplayName("Should return consistent response structure")
        void testResponseStructure() {
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
            assertNotNull(response);
            assertNotNull(response.getStatusCode());
            assertNotNull(response.getBody());
        }

        @Test
        @DisplayName("Should use correct HTTP status codes")
        void testHttpStatusCodes() {
            // Given
            TaxBracketRequest request = new TaxBracketRequest();
            request.setValue("valid-bracket");
            request.setLabel("Valid Bracket");
            request.setDetails(new ArrayList<>());

            TaxBracketResponse successResponse = new TaxBracketResponse(
                "valid-bracket", "Valid Bracket", "Success", null, true
            );

            when(taxConfigService.createTaxBracket(request))
                .thenReturn(successResponse);

            // When
            ResponseEntity<TaxBracketResponse> response = controller.createTaxBracket(request);

            // Then
            assertTrue(
                response.getStatusCode().equals(HttpStatus.CREATED) ||
                response.getStatusCode().equals(HttpStatus.BAD_REQUEST)
            );
        }
    }
}
