package com.personal.money.management.core.account.interfaces.api;

import com.personal.money.management.core.account.application.CurrencyService;
import com.personal.money.management.core.account.domain.model.Currency;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/api/currencies")
@Tag(name = "Currency", description = "API for managing currencies")
public class CurrencyController {

    private final CurrencyService currencyService;

    public CurrencyController(CurrencyService currencyService) {
        this.currencyService = currencyService;
    }

    @Operation(summary = "Get supported currencies", description = "Returns a list of supported currencies")
    @ApiResponse(responseCode = "200", description = "List of supported currencies",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = Currency.class)))
    @GetMapping
    public ResponseEntity<List<Currency>> getSupportedCurrencies() {
        List<Currency> currencies = currencyService.getAllCurrencies();
        return ResponseEntity.ok(currencies);
    }
}
