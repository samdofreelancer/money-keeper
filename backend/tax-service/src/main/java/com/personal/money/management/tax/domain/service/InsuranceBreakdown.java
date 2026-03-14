package com.personal.money.management.tax.domain.service;

/**
 * Value Object representing insurance calculation breakdown
 */
public class InsuranceBreakdown {
    private final long bhxh;
    private final long bhyt;
    private final long bhtn;
    private final long totalInsurance;

    public InsuranceBreakdown(long bhxh, long bhyt, long bhtn, long totalInsurance) {
        this.bhxh = bhxh;
        this.bhyt = bhyt;
        this.bhtn = bhtn;
        this.totalInsurance = totalInsurance;
    }

    public long getBhxh() { return bhxh; }
    public long getBhyt() { return bhyt; }
    public long getBhtn() { return bhtn; }
    public long getTotalInsurance() { return totalInsurance; }
}
