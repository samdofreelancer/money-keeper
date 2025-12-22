package com.personal.money.management.core.tax.domain.model;

/**
 * Enumeration for Vietnamese wage zones affecting insurance caps
 */
public enum WageZone {
    ZONE_I("I", "Vùng I (HN, TP.HCM)", 4_960_000, 99_200_000),
    ZONE_II("II", "Vùng II", 4_410_000, 88_200_000),
    ZONE_III("III", "Vùng III", 3_860_000, 77_200_000),
    ZONE_IV("IV", "Vùng IV", 3_450_000, 69_000_000);

    private final String code;
    private final String description;
    private final long minimumWage;
    private final long insuranceCap;

    WageZone(String code, String description, long minimumWage, long insuranceCap) {
        this.code = code;
        this.description = description;
        this.minimumWage = minimumWage;
        this.insuranceCap = insuranceCap;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public long getMinimumWage() {
        return minimumWage;
    }

    public long getInsuranceCap() {
        return insuranceCap;
    }

    public static WageZone fromCode(String code) {
        for (WageZone zone : values()) {
            if (zone.code.equals(code)) {
                return zone;
            }
        }
        return ZONE_I; // Default
    }
}
