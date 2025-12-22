package com.personal.money.management.core.tax.interfaces;

import com.personal.money.management.core.tax.application.SalaryCalculationRequest;
import com.personal.money.management.core.tax.application.SalaryCalculationResponse;
import com.personal.money.management.core.tax.application.TaxCalculatorApplicationService;
import com.personal.money.management.core.tax.domain.model.SalaryCalculationResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Tax Calculator API
 * Handles HTTP requests and responses
 */
@RestController
@RequestMapping("/api/tax")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class TaxCalculatorController {

    private final TaxCalculatorApplicationService taxCalculatorApplicationService;

    public TaxCalculatorController(TaxCalculatorApplicationService taxCalculatorApplicationService) {
        this.taxCalculatorApplicationService = taxCalculatorApplicationService;
    }

    /**
     * Calculate salary and tax for Vietnam personal income
     * @param request SalaryCalculationRequest containing salary details
     * @return SalaryCalculationResponse with calculated results
     */
    @PostMapping("/calculate")
    public ResponseEntity<SalaryCalculationResponse> calculateSalaryTax(@RequestBody SalaryCalculationRequest request) {
        SalaryCalculationResult result = taxCalculatorApplicationService.calculateSalaryTax(request);
        
        SalaryCalculationResponse response = new SalaryCalculationResponse(
            result.getGrossSalary(),
            result.getBhxh(),
            result.getBhyt(),
            result.getBhtn(),
            result.getTotalInsurance(),
            result.getIncomeAfterInsurance(),
            result.getTetBonus(),
            result.getTotalDeduction(),
            result.getTaxableIncome(),
            result.getTotalTax(),
            result.getSalaryTax(),
            result.getBonusTax(),
            result.getNetBeforeAllowance(),
            result.getTaxFreeAllowance(),
            result.getOtherDeduction(),
            result.getNetMonthly(),
            result.getNetBonus(),
            result.getTotalNetSalary()
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint for tax calculator service
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Tax Calculator Service is running");
    }
}
