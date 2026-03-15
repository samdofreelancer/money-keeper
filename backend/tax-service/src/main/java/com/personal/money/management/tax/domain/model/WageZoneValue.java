package com.personal.money.management.tax.domain.model;

/**
 * Value Object representing wage zone information
 */
public class WageZoneValue {
    private final String value;
    private final String label;
    private final long minimumWage;
    private final long insuranceCap;

    public WageZoneValue(String value, String label, long minimumWage, long insuranceCap) {
        this.value = value;
        this.label = label;
        this.minimumWage = minimumWage;
        this.insuranceCap = insuranceCap;
    }

    public String getValue() {
        return value;
    }

    public String getLabel() {
        return label;
    }

    public long getMinimumWage() {
        return minimumWage;
    }

    public long getInsuranceCap() {
        return insuranceCap;
    }

    @Override
    public String toString() {
        return "WageZoneValue{" +
                "value='" + value + '\'' +
                ", label='" + label + '\'' +
                ", minimumWage=" + minimumWage +
                ", insuranceCap=" + insuranceCap +
                '}';
    }
}
