package com.personal.money.management.core.tax.interfaces;

import com.personal.money.management.core.tax.application.TaxBracketRequest;
import com.personal.money.management.core.tax.application.TaxBracketResponse;
import com.personal.money.management.core.tax.application.TaxConfigService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Tax Configuration Management
 * Handles CRUD operations for tax brackets, deductions, and wage zones
 */
@RestController
@RequestMapping("/api/tax/brackets")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class TaxConfigController {
    
    private final TaxConfigService taxConfigService;
    
    public TaxConfigController(TaxConfigService taxConfigService) {
        this.taxConfigService = taxConfigService;
    }
    
    /**
     * Get all tax configuration options
     * GET /api/tax/brackets
     * @return TaxConfigResponse with all available configurations
     */
    @GetMapping
    public ResponseEntity<TaxConfigResponse> getTaxConfig() {
        return ResponseEntity.ok(taxConfigService.getTaxConfig());
    }
    
    /**
     * Get a specific tax bracket by value
     * GET /api/tax/brackets/bracket/{value}
     * @param value The bracket value (e.g., "7-bracket", "5-bracket")
     * @return Tax bracket details
     */
    @GetMapping("/bracket/{value}")
    public ResponseEntity<?> getTaxBracketByValue(@PathVariable String value) {
        var bracket = taxConfigService.getTaxBracketByValue(value);
        if (bracket == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Tax bracket not found: " + value));
        }
        return ResponseEntity.ok(bracket);
    }
    
    /**
     * Create a new tax bracket
     * POST /api/tax/brackets/bracket
     * @param request TaxBracketRequest with bracket details
     * @return TaxBracketResponse indicating success or failure
     */
    @PostMapping("/bracket")
    public ResponseEntity<TaxBracketResponse> createTaxBracket(@RequestBody TaxBracketRequest request) {
        // Validate request
        if (request.getValue() == null || request.getValue().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new TaxBracketResponse(
                            "", request.getLabel(), "", 
                            "Bracket value is required", false
                    ));
        }
        
        if (request.getDetails() == null || request.getDetails().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new TaxBracketResponse(
                            request.getValue(), request.getLabel(), "", 
                            "Bracket details are required", false
                    ));
        }
        
        TaxBracketResponse response = taxConfigService.createTaxBracket(request);
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Update an existing tax bracket
     * PUT /api/tax/brackets/bracket/{value}
     * @param value The bracket value to update (e.g., "7-bracket")
     * @param request TaxBracketRequest with updated details
     * @return TaxBracketResponse indicating success or failure
     */
    @PutMapping("/bracket/{value}")
    public ResponseEntity<TaxBracketResponse> updateTaxBracket(
            @PathVariable String value,
            @RequestBody TaxBracketRequest request) {
        
        // Validate request
        if (request.getDetails() == null || request.getDetails().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new TaxBracketResponse(
                            value, request.getLabel(), "", 
                            "Bracket details are required", false
                    ));
        }
        
        TaxBracketResponse response = taxConfigService.updateTaxBracket(value, request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Delete a tax bracket
     * DELETE /api/tax/brackets/bracket/{value}
     * @param value The bracket value to delete (e.g., "7-bracket")
     * @return TaxBracketResponse indicating success or failure
     */
    @DeleteMapping("/bracket/{value}")
    public ResponseEntity<TaxBracketResponse> deleteTaxBracket(@PathVariable String value) {
        TaxBracketResponse response = taxConfigService.deleteTaxBracket(value);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    /**
     * Reset all tax configuration to default values
     * POST /api/tax/brackets/reset
     * @return Success message
     */
    @PostMapping("/reset")
    public ResponseEntity<?> resetToDefaults() {
        String message = taxConfigService.resetToDefaults();
        return ResponseEntity.ok(new SuccessResponse(message));
    }
    
    /**
     * Success response DTO
     */
    public static class SuccessResponse {
        private String message;
        
        public SuccessResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
    
    /**
     * Error response DTO
     */
    public static class ErrorResponse {
        private String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
}
