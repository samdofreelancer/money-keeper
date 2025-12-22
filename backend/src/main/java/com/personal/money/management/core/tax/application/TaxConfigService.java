package com.personal.money.management.core.tax.application;

import com.personal.money.management.core.tax.interfaces.TaxConfigResponse;
import com.personal.money.management.core.tax.interfaces.TaxConfigResponse.TaxBracketOption;
import com.personal.money.management.core.tax.interfaces.TaxConfigResponse.DeductionBracketOption;
import com.personal.money.management.core.tax.interfaces.TaxConfigResponse.WageZoneOption;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for managing Tax Configuration
 * Provides configuration data for tax calculations
 */
@Service
public class TaxConfigService {
    
    /**
     * Get all tax configuration options
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
     * Get available tax bracket options
     * @return List of tax bracket options
     */
    private List<TaxBracketOption> getTaxBrackets() {
        List<TaxBracketOption> brackets = new ArrayList<>();
        brackets.add(new TaxBracketOption(
            "7-bracket",
            "7 bậc (13/12/2025 - 30/6/2026)",
            "2025-12-13"
        ));
        brackets.add(new TaxBracketOption(
            "5-bracket",
            "5 bậc (Từ 01/7/2026 trở đi)",
            "2026-07-01"
        ));
        return brackets;
    }
    
    /**
     * Get available deduction bracket options
     * @return List of deduction bracket options
     */
    private List<DeductionBracketOption> getDeductionBrackets() {
        List<DeductionBracketOption> deductions = new ArrayList<>();
        deductions.add(new DeductionBracketOption(
            "old",
            "13/12/2025 - 31/12/2025: Cá nhân 11M, Phụ thuộc 4.4M",
            11_000_000L,
            4_400_000L,
            "2025-12-13"
        ));
        deductions.add(new DeductionBracketOption(
            "new",
            "Từ 01/01/2026: Cá nhân 15.5M, Phụ thuộc 6.2M",
            15_500_000L,
            6_200_000L,
            "2026-01-01"
        ));
        return deductions;
    }
    
    /**
     * Get available wage zone options
     * @return List of wage zone options
     */
    private List<WageZoneOption> getWageZones() {
        List<WageZoneOption> zones = new ArrayList<>();
        zones.add(new WageZoneOption(
            "I",
            "Vùng I (HN, TP.HCM): 4.960.000 → Trần: 99.200.000",
            4_960_000L,
            99_200_000L
        ));
        zones.add(new WageZoneOption(
            "II",
            "Vùng II: 4.410.000 → Trần: 88.200.000",
            4_410_000L,
            88_200_000L
        ));
        zones.add(new WageZoneOption(
            "III",
            "Vùng III: 3.860.000 → Trần: 77.200.000",
            3_860_000L,
            77_200_000L
        ));
        zones.add(new WageZoneOption(
            "IV",
            "Vùng IV: 3.450.000 → Trần: 69.000.000",
            3_450_000L,
            69_000_000L
        ));
        return zones;
    }
}
