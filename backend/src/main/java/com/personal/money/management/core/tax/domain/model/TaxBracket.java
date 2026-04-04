package com.personal.money.management.core.tax.domain.model;

/**
 * Value Object representing tax bracket information for Vietnam personal income tax
 */
public class TaxBracket {
    private final long threshold;
    private final double rate;

    public TaxBracket(long threshold, double rate) {
        this.threshold = threshold;
        this.rate = rate;
    }

    public long getThreshold() {
        return threshold;
    }

    public double getRate() {
        return rate;
    }
}
