package com.personal.money.management.core.tax.domain.service;

import org.springframework.stereotype.Service;

/**
 * Configuration and Factory for Tax Domain Services
 */
@Service
public class TaxDomainServiceFactory {

    /**
     * Create a new instance of TaxCalculationService
     */
    public TaxCalculationService createTaxCalculationService() {
        return new TaxCalculationService();
    }
}
