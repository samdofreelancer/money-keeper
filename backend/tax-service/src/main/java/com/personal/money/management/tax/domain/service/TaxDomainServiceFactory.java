package com.personal.money.management.tax.domain.service;

import org.springframework.stereotype.Service;

/**
 * Configuration and Factory for Tax Domain Services
 */
@Service
public class TaxDomainServiceFactory {
    
    private final TaxBracketRepository taxBracketRepository;
    private final DeductionBracketRepository deductionBracketRepository;
    private final WageZoneRepository wageZoneRepository;
    
    public TaxDomainServiceFactory(TaxBracketRepository taxBracketRepository,
                                   DeductionBracketRepository deductionBracketRepository,
                                   WageZoneRepository wageZoneRepository) {
        this.taxBracketRepository = taxBracketRepository;
        this.deductionBracketRepository = deductionBracketRepository;
        this.wageZoneRepository = wageZoneRepository;
    }

    /**
     * Create a new instance of TaxCalculationService
     */
    public TaxCalculationService createTaxCalculationService() {
        return new TaxCalculationService(taxBracketRepository, deductionBracketRepository, wageZoneRepository);
    }
}
