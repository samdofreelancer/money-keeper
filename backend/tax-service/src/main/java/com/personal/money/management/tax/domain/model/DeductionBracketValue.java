package com.personal.money.management.tax.domain.model;

import java.time.LocalDate;

/**
 * Value Object representing deduction bracket information
 */
public class DeductionBracketValue {
    private final String value;
    private final String label;
    private final long personalDeduction;
    private final long dependentDeduction;
    private final LocalDate effectiveDate;

    public DeductionBracketValue(String value, String label, long personalDeduction, 
                                 long dependentDeduction, LocalDate effectiveDate) {
        this.value = value;
        this.label = label;
        this.personalDeduction = personalDeduction;
        this.dependentDeduction = dependentDeduction;
        this.effectiveDate = effectiveDate;
    }

    public String getValue() {
        return value;
    }

    public String getLabel() {
        return label;
    }

    public long getPersonalDeduction() {
        return personalDeduction;
    }

    public long getDependentDeduction() {
        return dependentDeduction;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    @Override
    public String toString() {
        return "DeductionBracketValue{" +
                "value='" + value + '\'' +
                ", label='" + label + '\'' +
                ", personalDeduction=" + personalDeduction +
                ", dependentDeduction=" + dependentDeduction +
                ", effectiveDate=" + effectiveDate +
                '}';
    }
}
