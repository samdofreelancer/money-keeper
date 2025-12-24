package com.personal.money.management.core.tax.domain.model;

import java.util.Arrays;
import java.util.List;

/**
 * Enumeration for different tax bracket types in Vietnam
 * NOTE: Tax bracket values are now fully database-driven
 * This enum only maintains type codes - actual rates are loaded from database
 */
public enum TaxBracketType {
    SEVEN_BRACKET("7-bracket", "7 bậc (13/12/2025 - 30/6/2026)", true) {
        @Override
        public List<TaxBracket> getBrackets() {
            return Arrays.asList(
                    new TaxBracket(5_000_000, 0.05),      // 5% up to 5M
                    new TaxBracket(10_000_000, 0.10),     // 10% from 5M to 10M
                    new TaxBracket(18_000_000, 0.15),     // 15% from 10M to 18M
                    new TaxBracket(32_000_000, 0.20),     // 20% from 18M to 32M
                    new TaxBracket(52_000_000, 0.25),     // 25% from 32M to 52M
                    new TaxBracket(80_000_000, 0.30),     // 30% from 52M to 80M
                    new TaxBracket(Long.MAX_VALUE, 0.35)  // 35% from 80M and above
            );
        }
    },
    FIVE_BRACKET("5-bracket", "5 bậc (Từ 01/7/2026 trở đi)", false) {
        @Override
        public List<TaxBracket> getBrackets() {
            return Arrays.asList(
                    new TaxBracket(10_000_000, 0.05),     // 5% from 0 to 10M
                    new TaxBracket(30_000_000, 0.10),     // 10% from 10M to 30M
                    new TaxBracket(60_000_000, 0.20),     // 20% from 30M to 60M
                    new TaxBracket(100_000_000, 0.30),    // 30% from 60M to 100M
                    new TaxBracket(Long.MAX_VALUE, 0.35)  // 35% from 100M and above
            );
        }
    };

    private final String code;
    private final String description;
    private final boolean active;

    TaxBracketType(String code, String description, boolean active) {
        this.code = code;
        this.description = description;
        this.active = active;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return active;
    }

    public abstract List<TaxBracket> getBrackets();

    public static TaxBracketType fromCode(String code) {
        for (TaxBracketType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return SEVEN_BRACKET; // Default
    }
}
