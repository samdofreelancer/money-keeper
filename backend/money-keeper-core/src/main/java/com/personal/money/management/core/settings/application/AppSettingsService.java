package com.personal.money.management.core.settings.application;

import com.personal.money.management.core.settings.infrastructure.persistence.AppSettingsEntity;
import com.personal.money.management.core.settings.infrastructure.persistence.AppSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppSettingsService {

    private final AppSettingsRepository repository;

    public AppSettingsService(AppSettingsRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public AppSettingsEntity get() {
        return repository.findById(1L).orElseGet(() -> {
            AppSettingsEntity e = new AppSettingsEntity();
            e.setId(1L);
            e.setDefaultCurrency("USD");
            return repository.save(e);
        });
    }

    @Transactional
    public AppSettingsEntity updateDefaultCurrency(String currency) {
        AppSettingsEntity e = get();
        e.setDefaultCurrency(currency);
        return repository.save(e);
    }

    @Transactional
    public AppSettingsEntity reset() {
        return updateDefaultCurrency("USD");
    }
} 