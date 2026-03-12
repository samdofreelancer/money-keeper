package com.personal.money.management.service.exchange.interfaces.api;

import com.personal.money.management.service.exchange.application.ExchangeRateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exchange-rates")
public class ExchangeRateController {

    private final ExchangeRateService service;

    public ExchangeRateController(ExchangeRateService service) {
        this.service = service;
    }

    @GetMapping("/latest")
    public ResponseEntity<ExchangeRateService.RatesResponse> latest(@RequestParam(name = "base", required = false) String base) {
        return ResponseEntity.ok(service.getLatestRates(base));
    }
} 