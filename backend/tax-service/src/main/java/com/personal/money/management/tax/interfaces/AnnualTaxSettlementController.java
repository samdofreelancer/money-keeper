package com.personal.money.management.tax.interfaces;

import com.personal.money.management.tax.application.AnnualTaxSettlementApplicationService;
import com.personal.money.management.tax.application.AnnualTaxSettlementRequest;
import com.personal.money.management.tax.domain.model.AnnualTaxSettlementResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Annual Tax Settlement
 */
@RestController
@RequestMapping("/api/tax/annual-settlement")
public class AnnualTaxSettlementController {
    
    private final AnnualTaxSettlementApplicationService annualTaxSettlementService;
    
    public AnnualTaxSettlementController(AnnualTaxSettlementApplicationService annualTaxSettlementService) {
        this.annualTaxSettlementService = annualTaxSettlementService;
    }
    
    /**
     * Calculate annual tax settlement
     * 
     * @param request Annual tax settlement request with salary and deduction info
     * @return Annual tax settlement result with calculated tax and amount due
     */
    @PostMapping("/calculate")
    public ResponseEntity<AnnualTaxSettlementResult> calculateAnnualTaxSettlement(
            @RequestBody AnnualTaxSettlementRequest request) {
        try {
            AnnualTaxSettlementResult result = annualTaxSettlementService.calculateAnnualTaxSettlement(request);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
