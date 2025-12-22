package com.personal.money.management.core.tax.domain.model;

/**
 * Enumeration for deduction bracket types in Vietnam personal income tax
 */
public enum DeductionBracket {
    OLD("old", "13/12/2025 - 31/12/2025", 11_000_000, 4_400_000),
    NEW("new", "Từ 01/01/2026", 15_500_000, 6_200_000);

    private final String code;
    private final String description;
    private final long personalDeduction;
    private final long dependentDeduction;

    DeductionBracket(String code, String description, long personalDeduction, long dependentDeduction) {
        this.code = code;
        this.description = description;
        this.personalDeduction = personalDeduction;
        this.dependentDeduction = dependentDeduction;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public long getPersonalDeduction() {
        return personalDeduction;
    }

    public long getDependentDeduction() {
        return dependentDeduction;
    }

    public static DeductionBracket fromCode(String code) {
        for (DeductionBracket bracket : values()) {
            if (bracket.code.equals(code)) {
                return bracket;
            }
        }
        return OLD; // Default
    }
}
