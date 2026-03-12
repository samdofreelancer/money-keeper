package com.personal.money.management.service.settings.interfaces.api;

import com.personal.money.management.service.settings.application.AppSettingsService;
import com.personal.money.management.service.settings.infrastructure.persistence.AppSettingsEntity;
import com.personal.money.management.service.settings.interfaces.api.dto.UpdateCurrencyRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

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

    @PutMapping("/currency")
    public ResponseEntity<AppSettingsEntity> updateCurrency(@Valid @RequestBody UpdateCurrencyRequest request) {
        return ResponseEntity.ok(service.updateDefaultCurrency(request.getDefaultCurrency()));
    }

    @PostMapping("/reset")
    public ResponseEntity<AppSettingsEntity> reset() {
        return ResponseEntity.ok(service.reset());
    }
} 