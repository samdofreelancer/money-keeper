package com.personal.money.management.core.tax.application;

import com.personal.money.management.core.tax.domain.model.TaxBracketEntity;
import com.personal.money.management.core.tax.domain.model.DeductionBracketEntity;
import com.personal.money.management.core.tax.domain.model.WageZoneEntity;
import com.personal.money.management.core.tax.domain.service.TaxBracketRepository;
import com.personal.money.management.core.tax.domain.service.DeductionBracketRepository;
import com.personal.money.management.core.tax.domain.service.WageZoneRepository;
import com.personal.money.management.core.tax.interfaces.TaxConfigResponse;
import com.personal.money.management.core.tax.interfaces.TaxConfigResponse.TaxBracketOption;
import com.personal.money.management.core.tax.interfaces.TaxConfigResponse.DeductionBracketOption;
import com.personal.money.management.core.tax.interfaces.TaxConfigResponse.WageZoneOption;
import com.personal.money.management.core.tax.interfaces.TaxConfigResponse.TaxBracketDetail;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for managing Tax Configuration
 * Provides configuration data from database for tax calculations
 */
@Service
public class TaxConfigService {
    
    private final TaxBracketRepository taxBracketRepository;
    private final DeductionBracketRepository deductionBracketRepository;
    private final WageZoneRepository wageZoneRepository;
    
    public TaxConfigService(
            TaxBracketRepository taxBracketRepository,
            DeductionBracketRepository deductionBracketRepository,
            WageZoneRepository wageZoneRepository) {
        this.taxBracketRepository = taxBracketRepository;
        this.deductionBracketRepository = deductionBracketRepository;
        this.wageZoneRepository = wageZoneRepository;
    }
    
    /**
     * Get all tax configuration options from database
     * @return TaxConfigResponse with all configuration options
     */
    public TaxConfigResponse getTaxConfig() {
        return new TaxConfigResponse(
            getTaxBrackets(),
            getDeductionBrackets(),
            getWageZones()
        );
    }
    
    /**
     * Get available tax bracket options from database
     * @return List of tax bracket options
     */
    private List<TaxBracketOption> getTaxBrackets() {
        List<TaxBracketOption> options = new ArrayList<>();
        List<TaxBracketEntity> entities = taxBracketRepository.findAllOrderByEffectiveDate();
        
        for (TaxBracketEntity entity : entities) {
            List<TaxBracketDetail> details = new ArrayList<>();
            if (entity.getDetails() != null) {
                entity.getDetails().forEach(detail -> {
                    details.add(new TaxBracketDetail(
                        detail.getMinIncome(),
                        detail.getMaxIncome(),
                        detail.getRate().doubleValue(),
                        detail.getDeduction(),
                        detail.getBracketOrder()
                    ));
                });
            }
            
            TaxBracketOption option = new TaxBracketOption(
                entity.getValue(),
                entity.getLabel(),
                entity.getEffectiveDate().toString(),
                details
            );
            options.add(option);
        }
        
        return options;
    }
    
    /**
     * Get available deduction bracket options from database
     * @return List of deduction bracket options
     */
    private List<DeductionBracketOption> getDeductionBrackets() {
        List<DeductionBracketOption> options = new ArrayList<>();
        List<DeductionBracketEntity> entities = deductionBracketRepository.findAll();
        
        for (DeductionBracketEntity entity : entities) {
            DeductionBracketOption option = new DeductionBracketOption(
                entity.getValue(),
                entity.getLabel(),
                entity.getPersonalDeduction(),
                entity.getDependentDeduction(),
                entity.getEffectiveDate().toString()
            );
            options.add(option);
        }
        
        return options;
    }
    
    /**
     * Get available wage zone options from database
     * @return List of wage zone options
     */
    private List<WageZoneOption> getWageZones() {
        List<WageZoneOption> options = new ArrayList<>();
        List<WageZoneEntity> entities = wageZoneRepository.findAll();
        
        for (WageZoneEntity entity : entities) {
            WageZoneOption option = new WageZoneOption(
                entity.getValue(),
                entity.getLabel(),
                entity.getMinimumWage(),
                entity.getBhtnCeiling()
            );
            options.add(option);
        }
        
        return options;
    }
}
