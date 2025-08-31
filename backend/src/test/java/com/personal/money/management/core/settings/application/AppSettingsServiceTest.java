package com.personal.money.management.core.settings.application;

import com.personal.money.management.core.settings.infrastructure.persistence.AppSettingsEntity;
import com.personal.money.management.core.settings.infrastructure.persistence.AppSettingsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AppSettingsService.
 * Focuses on business logic with mocked dependencies.
 * Persistence and integration tested separately.
 */
class AppSettingsServiceTest {
    private AppSettingsRepository repository;
    private AppSettingsService service;

    @BeforeEach
    void setUp() {
        repository = mock(AppSettingsRepository.class);
        service = new AppSettingsService(repository);
    }

    @Test
    void get_shouldReturnExistingSettings_whenSettingsExist() {
        AppSettingsEntity existingSettings = new AppSettingsEntity();
        existingSettings.setId(1L);
        existingSettings.setDefaultCurrency("EUR");

        when(repository.findById(1L)).thenReturn(Optional.of(existingSettings));

        AppSettingsEntity result = service.get();

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("EUR", result.getDefaultCurrency());
        verify(repository).findById(1L);
        verify(repository, never()).save(any());
    }

    @Test
    void get_shouldCreateDefaultSettings_whenSettingsDoNotExist() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        when(repository.save(any(AppSettingsEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AppSettingsEntity result = service.get();

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("USD", result.getDefaultCurrency());
        verify(repository).findById(1L);

        ArgumentCaptor<AppSettingsEntity> captor = ArgumentCaptor.forClass(AppSettingsEntity.class);
        verify(repository).save(captor.capture());
        AppSettingsEntity savedSettings = captor.getValue();
        assertEquals(1L, savedSettings.getId());
        assertEquals("USD", savedSettings.getDefaultCurrency());
    }

    @Test
    void updateDefaultCurrency_shouldUpdateExistingSettings() {
        AppSettingsEntity existingSettings = new AppSettingsEntity();
        existingSettings.setId(1L);
        existingSettings.setDefaultCurrency("EUR");

        when(repository.findById(1L)).thenReturn(Optional.of(existingSettings));
        when(repository.save(any(AppSettingsEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AppSettingsEntity result = service.updateDefaultCurrency("GBP");

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("GBP", result.getDefaultCurrency());
        verify(repository).findById(1L);
        verify(repository).save(existingSettings);
    }

    @Test
    void updateDefaultCurrency_shouldCreateSettingsIfNotExist() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        when(repository.save(any(AppSettingsEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AppSettingsEntity result = service.updateDefaultCurrency("GBP");

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("GBP", result.getDefaultCurrency());
        verify(repository).findById(1L);
        // get() creates default settings, then updateDefaultCurrency saves again
        verify(repository, times(2)).save(any(AppSettingsEntity.class));
    }

    @Test
    void reset_shouldUpdateCurrencyToUSD() {
        AppSettingsEntity existingSettings = new AppSettingsEntity();
        existingSettings.setId(1L);
        existingSettings.setDefaultCurrency("EUR");

        when(repository.findById(1L)).thenReturn(Optional.of(existingSettings));
        when(repository.save(any(AppSettingsEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AppSettingsEntity result = service.reset();

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("USD", result.getDefaultCurrency());
        verify(repository).findById(1L);
        verify(repository).save(existingSettings);
    }

    @Test
    void reset_shouldCreateSettingsWithUSDIfNotExist() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        when(repository.save(any(AppSettingsEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AppSettingsEntity result = service.reset();

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("USD", result.getDefaultCurrency());
        verify(repository).findById(1L);
        // get() creates default settings, then reset saves again
        verify(repository, times(2)).save(any(AppSettingsEntity.class));
    }
}
