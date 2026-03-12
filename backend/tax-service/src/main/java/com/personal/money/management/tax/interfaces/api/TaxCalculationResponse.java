package com.personal.money.management.tax.interfaces.api;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class TaxCalculationResponse {
    private BigDecimal income;
    private BigDecimal totalTax;
    private BigDecimal effectiveRate;
}
