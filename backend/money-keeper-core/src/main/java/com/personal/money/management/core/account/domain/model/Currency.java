package com.personal.money.management.core.account.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Currency {
    private Long id;
    private String code;
    private String name;
    private String symbol;
    private String flag;
}
