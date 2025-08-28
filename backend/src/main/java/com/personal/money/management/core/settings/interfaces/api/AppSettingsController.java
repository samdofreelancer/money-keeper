package com.personal.money.management.core.settings.interfaces.api;

import com.personal.money.management.core.settings.application.AppSettingsService;
import com.personal.money.management.core.settings.infrastructure.persistence.AppSettingsEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class AppSettingsController {

    private final AppSettingsService service;

    public AppSettingsController(AppSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<AppSettingsEntity> get() {
        return ResponseEntity.ok(service.get());
    }

    public static class UpdateCurrencyRequest {
        public String defaultCurrency;
        public String getDefaultCurrency() { return defaultCurrency; }
        public void setDefaultCurrency(String defaultCurrency) { this.defaultCurrency = defaultCurrency; }
    }

    @PutMapping("/currency")
    public ResponseEntity<AppSettingsEntity> updateCurrency(@RequestBody UpdateCurrencyRequest request) {
        return ResponseEntity.ok(service.updateDefaultCurrency(request.defaultCurrency));
    }

    @PostMapping("/reset")
    public ResponseEntity<AppSettingsEntity> reset() {
        return ResponseEntity.ok(service.reset());
    }
} 