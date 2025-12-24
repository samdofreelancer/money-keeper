package com.personal.money.management.core.tax.application;

import com.personal.money.management.core.tax.domain.model.*;
import com.personal.money.management.core.tax.domain.service.TaxBracketRepository;
import com.personal.money.management.core.tax.domain.service.TaxBracketDetailRepository;
import com.personal.money.management.core.tax.domain.service.DeductionBracketRepository;
import com.personal.money.management.core.tax.domain.service.WageZoneRepository;
import com.personal.money.management.core.tax.interfaces.TaxConfigResponse;
import com.personal.money.management.core.tax.interfaces.TaxConfigResponse.TaxBracketOption;
import com.personal.money.management.core.tax.interfaces.TaxConfigResponse.DeductionBracketOption;
import com.personal.money.management.core.tax.interfaces.TaxConfigResponse.WageZoneOption;
import com.personal.money.management.core.tax.interfaces.TaxConfigResponse.TaxBracketDetail;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Service for managing Tax Configuration
 * Provides configuration data from database for tax calculations
 */
@Service
public class TaxConfigService {
    
    private final TaxBracketRepository taxBracketRepository;
    private final TaxBracketDetailRepository taxBracketDetailRepository;
    private final DeductionBracketRepository deductionBracketRepository;
    private final WageZoneRepository wageZoneRepository;
    
    public TaxConfigService(
            TaxBracketRepository taxBracketRepository,
            TaxBracketDetailRepository taxBracketDetailRepository,
            DeductionBracketRepository deductionBracketRepository,
            WageZoneRepository wageZoneRepository) {
        this.taxBracketRepository = taxBracketRepository;
        this.taxBracketDetailRepository = taxBracketDetailRepository;
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
    
    /**
     * Create a new tax bracket with details
     * @param request Tax bracket request with bracket details
     * @return Response indicating success or failure
     */
    @Transactional
    public TaxBracketResponse createTaxBracket(TaxBracketRequest request) {
        try {
            // Create bracket entity
            TaxBracketEntity bracket = new TaxBracketEntity(
                UUID.randomUUID().toString(),  // Generate unique ID
                request.getValue(),
                request.getLabel(),
                request.getEffectiveDate()
            );
            
            // Create and add bracket details
            List<TaxBracketDetailEntity> details = new ArrayList<>();
            if (request.getDetails() != null) {
                for (int i = 0; i < request.getDetails().size(); i++) {
                    TaxBracketRequest.TaxBracketDetailRequest detailRequest = request.getDetails().get(i);
                    
                    // Ensure bracketOrder is set (use index + 1 if not provided)
                    Integer bracketOrder = detailRequest.getBracketOrder();
                    if (bracketOrder == null || bracketOrder <= 0) {
                        bracketOrder = i + 1;
                    }
                    
                    TaxBracketDetailEntity detail = new TaxBracketDetailEntity(
                        UUID.randomUUID().toString(),
                        bracket,
                        detailRequest.getMinIncome(),
                        detailRequest.getMaxIncome(),
                        detailRequest.getRate(),
                        detailRequest.getDeduction(),
                        bracketOrder  // Guaranteed non-null
                    );
                    details.add(detail);
                }
            }
            bracket.setDetails(details);
            
            // Save to database
            taxBracketRepository.save(bracket);
            
            return new TaxBracketResponse(
                bracket.getValue(),
                bracket.getLabel(),
                bracket.getEffectiveDate().toString(),
                "Tax bracket created successfully",
                true
            );
        } catch (Exception e) {
            return new TaxBracketResponse(
                request.getValue(),
                request.getLabel(),
                request.getEffectiveDate() != null ? request.getEffectiveDate().toString() : "",
                "Error creating tax bracket: " + e.getMessage(),
                false
            );
        }
    }
    
    /**
     * Update an existing tax bracket and its details
     * @param value The bracket value to update (e.g., "7-bracket")
     * @param request Updated tax bracket request
     * @return Response indicating success or failure
     */
    @Transactional
    public TaxBracketResponse updateTaxBracket(String value, TaxBracketRequest request) {
        try {
            // Find existing bracket
            Optional<TaxBracketEntity> optionalBracket = taxBracketRepository.findByValue(value);
            if (!optionalBracket.isPresent()) {
                return new TaxBracketResponse(
                    value,
                    request.getLabel(),
                    request.getEffectiveDate() != null ? request.getEffectiveDate().toString() : "",
                    "Tax bracket not found",
                    false
                );
            }
            
            TaxBracketEntity bracket = optionalBracket.get();
            
            // Update bracket properties
            bracket.setLabel(request.getLabel());
            bracket.setEffectiveDate(request.getEffectiveDate());
            bracket.setUpdatedAt(LocalDateTime.now());
            
            // Delete all old details first (prevents duplicates)
            taxBracketDetailRepository.deleteByBracket(bracket);
            
            // Create new details
            List<TaxBracketDetailEntity> newDetails = new ArrayList<>();
            if (request.getDetails() != null) {
                for (int i = 0; i < request.getDetails().size(); i++) {
                    TaxBracketRequest.TaxBracketDetailRequest detailRequest = request.getDetails().get(i);
                    
                    // Ensure bracketOrder is set (use index + 1 if not provided)
                    Integer bracketOrder = detailRequest.getBracketOrder();
                    if (bracketOrder == null || bracketOrder <= 0) {
                        bracketOrder = i + 1;
                    }
                    
                    TaxBracketDetailEntity detail = new TaxBracketDetailEntity(
                        UUID.randomUUID().toString(),
                        bracket,
                        detailRequest.getMinIncome(),
                        detailRequest.getMaxIncome(),
                        detailRequest.getRate(),
                        detailRequest.getDeduction(),
                        bracketOrder  // Guaranteed non-null
                    );
                    detail.setCreatedAt(LocalDateTime.now());
                    detail.setUpdatedAt(LocalDateTime.now());
                    newDetails.add(detail);
                }
            }
            bracket.setDetails(newDetails);
            
            // Save to database
            taxBracketRepository.save(bracket);
            
            return new TaxBracketResponse(
                bracket.getValue(),
                bracket.getLabel(),
                bracket.getEffectiveDate().toString(),
                "Tax bracket updated successfully",
                true
            );
        } catch (Exception e) {
            return new TaxBracketResponse(
                value,
                request.getLabel(),
                request.getEffectiveDate() != null ? request.getEffectiveDate().toString() : "",
                "Error updating tax bracket: " + e.getMessage(),
                false
            );
        }
    }
    
    /**
     * Delete a tax bracket by value
     * @param value The bracket value to delete (e.g., "7-bracket")
     * @return Response indicating success or failure
     */
    @Transactional
    public TaxBracketResponse deleteTaxBracket(String value) {
        try {
            // Find and delete bracket
            Optional<TaxBracketEntity> optionalBracket = taxBracketRepository.findByValue(value);
            if (!optionalBracket.isPresent()) {
                return new TaxBracketResponse(
                    value,
                    "",
                    "",
                    "Tax bracket not found",
                    false
                );
            }
            
            TaxBracketEntity bracket = optionalBracket.get();
            taxBracketRepository.delete(bracket);
            
            return new TaxBracketResponse(
                bracket.getValue(),
                bracket.getLabel(),
                bracket.getEffectiveDate().toString(),
                "Tax bracket deleted successfully",
                true
            );
        } catch (Exception e) {
            return new TaxBracketResponse(
                value,
                "",
                "",
                "Error deleting tax bracket: " + e.getMessage(),
                false
            );
        }
    }
    
    /**
     * Get a specific tax bracket by value
     * @param value The bracket value (e.g., "7-bracket")
     * @return Tax bracket details or null if not found
     */
    public TaxBracketOption getTaxBracketByValue(String value) {
        Optional<TaxBracketEntity> optionalBracket = taxBracketRepository.findByValue(value);
        if (!optionalBracket.isPresent()) {
            return null;
        }
        
        TaxBracketEntity entity = optionalBracket.get();
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
        
        return new TaxBracketOption(
            entity.getValue(),
            entity.getLabel(),
            entity.getEffectiveDate().toString(),
            details
        );
    }
    
    /**
     * Reset all tax configuration to default values
     * @return Message indicating reset was successful
     */
    @Transactional
    public String resetToDefaults() {
        // Delete all detail records first (to avoid foreign key violations)
        taxBracketDetailRepository.deleteAllDetails();
        
        // Then delete bracket, deduction, and wage zone records
        taxBracketRepository.deleteAllBrackets();
        deductionBracketRepository.deleteAllDeductions();
        wageZoneRepository.deleteAllZones();
        
        // Re-insert default configuration
        initializeDefaultConfiguration();
        
        return "Cấu hình thuế đã được đặt lại về mặc định";
    }
    
    /**
     * Initialize default tax configuration (7-bracket, 5-bracket, deductions, wage zones)
     */
    private void initializeDefaultConfiguration() {
        LocalDateTime now = LocalDateTime.now();
        
        // 7-bracket configuration
        TaxBracketEntity sevenBracket = new TaxBracketEntity(
            UUID.randomUUID().toString(),
            "7-bracket",
            "7 bậc (13/12/2025 - 30/6/2026)",
            LocalDate.of(2025, 12, 13)
        );
        sevenBracket.setCreatedAt(now);
        sevenBracket.setUpdatedAt(now);
        
        List<TaxBracketDetailEntity> sevenDetails = new ArrayList<>();
        sevenDetails.add(createBracketDetail(sevenBracket, 0L, 5000000L, 5.0, 0L, 1, now));
        sevenDetails.add(createBracketDetail(sevenBracket, 5000001L, 10000000L, 10.0, 250000L, 2, now));
        sevenDetails.add(createBracketDetail(sevenBracket, 10000001L, 18000000L, 15.0, 750000L, 3, now));
        sevenDetails.add(createBracketDetail(sevenBracket, 18000001L, 32000000L, 20.0, 1650000L, 4, now));
        sevenDetails.add(createBracketDetail(sevenBracket, 32000001L, 52000000L, 25.0, 3250000L, 5, now));
        sevenDetails.add(createBracketDetail(sevenBracket, 52000001L, 80000000L, 30.0, 5250000L, 6, now));
        sevenDetails.add(createBracketDetail(sevenBracket, 80000001L, null, 35.0, 7250000L, 7, now));
        sevenBracket.setDetails(sevenDetails);
        
        taxBracketRepository.save(sevenBracket);
        
        // 5-bracket configuration
        TaxBracketEntity fiveBracket = new TaxBracketEntity(
            UUID.randomUUID().toString(),
            "5-bracket",
            "5 bậc (Từ 01/7/2026 trở đi)",
            LocalDate.of(2026, 7, 1)
        );
        fiveBracket.setCreatedAt(now);
        fiveBracket.setUpdatedAt(now);
        
        List<TaxBracketDetailEntity> fiveDetails = new ArrayList<>();
        fiveDetails.add(createBracketDetail(fiveBracket, 0L, 10000000L, 5.0, 0L, 1, now));
        fiveDetails.add(createBracketDetail(fiveBracket, 10000001L, 30000000L, 10.0, 500000L, 2, now));
        fiveDetails.add(createBracketDetail(fiveBracket, 30000001L, 60000000L, 20.0, 3500000L, 3, now));
        fiveDetails.add(createBracketDetail(fiveBracket, 60000001L, 100000000L, 30.0, 9500000L, 4, now));
        fiveDetails.add(createBracketDetail(fiveBracket, 100000001L, null, 35.0, 14500000L, 5, now));
        fiveBracket.setDetails(fiveDetails);
        
        taxBracketRepository.save(fiveBracket);
        
        // Deduction brackets
        DeductionBracketEntity oldDeduction = new DeductionBracketEntity();
        oldDeduction.setId(UUID.randomUUID().toString());
        oldDeduction.setValue("old");
        oldDeduction.setLabel("13/12/2025 - 31/12/2025: Cá nhân 11M, Phụ thuộc 4.4M");
        oldDeduction.setPersonalDeduction(11000000L);
        oldDeduction.setDependentDeduction(4400000L);
        oldDeduction.setEffectiveDate(LocalDate.of(2025, 12, 13));
        oldDeduction.setCreatedAt(now);
        oldDeduction.setUpdatedAt(now);
        deductionBracketRepository.save(oldDeduction);
        
        DeductionBracketEntity newDeduction = new DeductionBracketEntity();
        newDeduction.setId(UUID.randomUUID().toString());
        newDeduction.setValue("new");
        newDeduction.setLabel("Từ 01/01/2026: Cá nhân 15.5M, Phụ thuộc 6.2M");
        newDeduction.setPersonalDeduction(15500000L);
        newDeduction.setDependentDeduction(6200000L);
        newDeduction.setEffectiveDate(LocalDate.of(2026, 1, 1));
        newDeduction.setCreatedAt(now);
        newDeduction.setUpdatedAt(now);
        deductionBracketRepository.save(newDeduction);
        
        // Wage zones
        WageZoneEntity zoneI = new WageZoneEntity();
        zoneI.setId(UUID.randomUUID().toString());
        zoneI.setValue("I");
        zoneI.setLabel("Vùng I (HN, TP.HCM): 4.960.000 → Trần: 99.200.000");
        zoneI.setMinimumWage(4960000L);
        zoneI.setBhtnCeiling(99200000L);
        zoneI.setCreatedAt(now);
        zoneI.setUpdatedAt(now);
        wageZoneRepository.save(zoneI);
        
        WageZoneEntity zoneII = new WageZoneEntity();
        zoneII.setId(UUID.randomUUID().toString());
        zoneII.setValue("II");
        zoneII.setLabel("Vùng II: 4.410.000 → Trần: 88.200.000");
        zoneII.setMinimumWage(4410000L);
        zoneII.setBhtnCeiling(88200000L);
        zoneII.setCreatedAt(now);
        zoneII.setUpdatedAt(now);
        wageZoneRepository.save(zoneII);
    }
    
    /**
     * Helper method to create tax bracket detail
     */
    private TaxBracketDetailEntity createBracketDetail(TaxBracketEntity bracket, long minIncome, Long maxIncome, 
                                                       double rate, long deduction, int bracketOrder, LocalDateTime now) {
        TaxBracketDetailEntity detail = new TaxBracketDetailEntity(
            UUID.randomUUID().toString(),
            bracket,
            minIncome,
            maxIncome,
            rate,
            deduction,
            bracketOrder
        );
        detail.setCreatedAt(now);
        detail.setUpdatedAt(now);
        return detail;
    }
}
