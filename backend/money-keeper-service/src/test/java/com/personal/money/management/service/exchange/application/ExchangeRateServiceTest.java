package com.personal.money.management.service.exchange.application;

import com.personal.money.management.service.exchange.infrastructure.persistence.ExchangeRateEntity;
import com.personal.money.management.service.exchange.infrastructure.persistence.ExchangeRateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ExchangeRateService.
 * Focuses on business logic with mocked dependencies.
 * Persistence and integration tested separately.
 */
class ExchangeRateServiceTest {
    private ExchangeRateRepository repository;
    private RestTemplate restTemplate;
    private ExchangeRateService service;

    @BeforeEach
    void setUp() {
        repository = mock(ExchangeRateRepository.class);
        restTemplate = mock(RestTemplate.class);
        service = new ExchangeRateService(repository);
        // Use reflection to set the restTemplate field for testing
        try {
            var restTemplateField = ExchangeRateService.class.getDeclaredField("restTemplate");
            restTemplateField.setAccessible(true);
            restTemplateField.set(service, restTemplate);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set restTemplate field", e);
        }
    }

    @Test
    void getLatestRates_shouldReturnCachedRates_whenCacheIsValid() {
        // Arrange
        ExchangeRateService.RatesResponse cachedResponse = new ExchangeRateService.RatesResponse();
        cachedResponse.setBase("EUR");
        Map<String, Double> rates = new HashMap<>();
        rates.put("USD", 1.1);
        rates.put("GBP", 0.85);
        cachedResponse.setRates(rates);

        // Use reflection to set cache
        try {
            var cacheField = ExchangeRateService.class.getDeclaredField("cache");
            cacheField.setAccessible(true);
            @SuppressWarnings("unchecked")
            Map<String, Object> cache = (Map<String, Object>) cacheField.get(service);
            
            var cacheEntryClass = Class.forName("com.personal.money.management.service.exchange.application.ExchangeRateService$CacheEntry");
            var constructor = cacheEntryClass.getDeclaredConstructor(ExchangeRateService.RatesResponse.class, long.class);
            constructor.setAccessible(true);
            Object cacheEntry = constructor.newInstance(cachedResponse, Instant.now().toEpochMilli());
            
            cache.put("EUR", cacheEntry);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set cache", e);
        }

        // Act
        ExchangeRateService.RatesResponse result = service.getLatestRates("EUR");

        // Assert
        assertNotNull(result);
        assertEquals("EUR", result.getBase());
        assertEquals(1.1, result.getRates().get("USD"));
        assertEquals(0.85, result.getRates().get("GBP"));
        verifyNoInteractions(repository);
        verifyNoInteractions(restTemplate);
    }

    @Test
    void getLatestRates_shouldReturnFromDb_whenCacheExpiredButDbHasData() {
        // Arrange
        LocalDate today = LocalDate.now();
        List<ExchangeRateEntity> dbRates = Arrays.asList(
            createExchangeRateEntity("EUR", "USD", 1.1, today),
            createExchangeRateEntity("EUR", "GBP", 0.85, today)
        );

        when(repository.findByBaseAndRateDate("EUR", today)).thenReturn(dbRates);

        // Act
        ExchangeRateService.RatesResponse result = service.getLatestRates("EUR");

        // Assert
        assertNotNull(result);
        assertEquals("EUR", result.getBase());
        assertEquals(1.1, result.getRates().get("USD"));
        assertEquals(0.85, result.getRates().get("GBP"));
        verify(repository).findByBaseAndRateDate("EUR", today);
        verifyNoInteractions(restTemplate);
    }

    @Test
    void getLatestRates_shouldReturnFromProvider_whenCacheAndDbEmpty() {
        // Arrange
        LocalDate today = LocalDate.now();
        when(repository.findByBaseAndRateDate("EUR", today)).thenReturn(Collections.emptyList());
        when(repository.findByRateDate(today)).thenReturn(Collections.emptyList());

        ExchangeRateService.RatesResponse providerResponse = new ExchangeRateService.RatesResponse();
        providerResponse.setBase("EUR");
        Map<String, Double> rates = new HashMap<>();
        rates.put("USD", 1.1);
        rates.put("GBP", 0.85);
        providerResponse.setRates(rates);

        when(restTemplate.getForEntity(anyString(), eq(ExchangeRateService.RatesResponse.class)))
            .thenReturn(ResponseEntity.ok(providerResponse));

        // Act
        ExchangeRateService.RatesResponse result = service.getLatestRates("EUR");

        // Assert
        assertNotNull(result);
        assertEquals("EUR", result.getBase());
        assertEquals(1.1, result.getRates().get("USD"));
        assertEquals(0.85, result.getRates().get("GBP"));
        verify(repository).findByBaseAndRateDate("EUR", today);
        verify(repository).findByRateDate(today);
        verify(restTemplate).getForEntity(anyString(), eq(ExchangeRateService.RatesResponse.class));
    }

    @Test
    void getLatestRates_shouldReturnFallback_whenAllSourcesFail() {
        // Arrange
        LocalDate today = LocalDate.now();
        when(repository.findByBaseAndRateDate("EUR", today)).thenReturn(Collections.emptyList());
        when(repository.findByRateDate(today)).thenReturn(Collections.emptyList());
        when(restTemplate.getForEntity(anyString(), eq(ExchangeRateService.RatesResponse.class)))
            .thenThrow(new RuntimeException("API error"));

        // Act
        ExchangeRateService.RatesResponse result = service.getLatestRates("EUR");

        // Assert
        assertNotNull(result);
        assertEquals("EUR", result.getBase());
        assertEquals(1.0, result.getRates().get("EUR"));
        assertEquals(1, result.getRates().size());
        verify(repository).findByBaseAndRateDate("EUR", today);
        verify(repository).findByRateDate(today);
        verify(restTemplate).getForEntity(anyString(), eq(ExchangeRateService.RatesResponse.class));
    }

    @Test
    void getLatestRates_shouldNormalizeToRequestedBase() {
        // Arrange
        LocalDate today = LocalDate.now();
        List<ExchangeRateEntity> dbRates = Arrays.asList(
            createExchangeRateEntity("USD", "EUR", 0.91, today),
            createExchangeRateEntity("USD", "GBP", 0.77, today),
            createExchangeRateEntity("USD", "USD", 1.0, today) // Add USD rate explicitly
        );

        when(repository.findByBaseAndRateDate("USD", today)).thenReturn(dbRates);

        // Act
        ExchangeRateService.RatesResponse result = service.getLatestRates("USD");

        // Assert
        assertNotNull(result);
        assertEquals("USD", result.getBase());
        assertEquals(0.91, result.getRates().get("EUR"));
        assertEquals(0.77, result.getRates().get("GBP"));
        assertEquals(1.0, result.getRates().get("USD"));
    }

    @Test
    void persistRates_shouldSaveAllRatesToRepository() {
        // Arrange
        ExchangeRateService.RatesResponse response = new ExchangeRateService.RatesResponse();
        response.setBase("EUR");
        Map<String, Double> rates = new HashMap<>();
        rates.put("USD", 1.1);
        rates.put("GBP", 0.85);
        response.setRates(rates);

        // Act
        service.persistRates("EUR", response);

        // Assert
        ArgumentCaptor<ExchangeRateEntity> captor = ArgumentCaptor.forClass(ExchangeRateEntity.class);
        verify(repository, times(3)).save(captor.capture());  // 3 times because base currency rate is also saved

        List<ExchangeRateEntity> savedEntities = captor.getAllValues();
        assertEquals(3, savedEntities.size());

        ExchangeRateEntity usdEntity = savedEntities.stream()
            .filter(e -> "USD".equals(e.getSymbol()))
            .findFirst()
            .orElseThrow();
        assertEquals("EUR", usdEntity.getBase());
        assertEquals("USD", usdEntity.getSymbol());
        assertEquals(1.1, usdEntity.getRate());
        assertEquals(LocalDate.now(), usdEntity.getRateDate());

        ExchangeRateEntity gbpEntity = savedEntities.stream()
            .filter(e -> "GBP".equals(e.getSymbol()))
            .findFirst()
            .orElseThrow();
        assertEquals("EUR", gbpEntity.getBase());
        assertEquals("GBP", gbpEntity.getSymbol());
        assertEquals(0.85, gbpEntity.getRate());
        assertEquals(LocalDate.now(), gbpEntity.getRateDate());
    }

    @Test
    void persistRates_shouldDoNothing_whenResponseIsNull() {
        // Act
        service.persistRates("EUR", null);

        // Assert
        verifyNoInteractions(repository);
    }

    @Test
    void persistRates_shouldDoNothing_whenRatesAreNull() {
        // Arrange
        ExchangeRateService.RatesResponse response = new ExchangeRateService.RatesResponse();
        response.setBase("EUR");
        response.setRates(null);

        // Act
        service.persistRates("EUR", response);

        // Assert
        verifyNoInteractions(repository);
    }

    @Test
    void refreshDaily_shouldPersistRatesFromProvider() {
        // Arrange
        ExchangeRateService.RatesResponse providerResponse = new ExchangeRateService.RatesResponse();
        providerResponse.setBase("EUR");
        Map<String, Double> rates = new HashMap<>();
        rates.put("USD", 1.1);
        rates.put("GBP", 0.85);
        providerResponse.setRates(rates);

        when(restTemplate.getForEntity(anyString(), eq(ExchangeRateService.RatesResponse.class)))
            .thenReturn(ResponseEntity.ok(providerResponse));

        // Act
        service.refreshDaily();

        // Assert
        verify(restTemplate).getForEntity(anyString(), eq(ExchangeRateService.RatesResponse.class));
        verify(repository, times(13)).save(any(ExchangeRateEntity.class)); // Initial save plus normalized copies for EUR, USD, VND with additional derived rates
    }

    @Test
    void refreshDaily_shouldHandleProviderFailureGracefully() {
        // Arrange
        when(restTemplate.getForEntity(anyString(), eq(ExchangeRateService.RatesResponse.class)))
            .thenThrow(new RuntimeException("API error"));

        // Act
        service.refreshDaily();

        // Assert
        verify(restTemplate).getForEntity(anyString(), eq(ExchangeRateService.RatesResponse.class));
        verifyNoInteractions(repository);
    }

    private ExchangeRateEntity createExchangeRateEntity(String base, String symbol, double rate, LocalDate date) {
        ExchangeRateEntity entity = new ExchangeRateEntity();
        entity.setBase(base);
        entity.setSymbol(symbol);
        entity.setRate(rate);
        entity.setRateDate(date);
        return entity;
    }
}
