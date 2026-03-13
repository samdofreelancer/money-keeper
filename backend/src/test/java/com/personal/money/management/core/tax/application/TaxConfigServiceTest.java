package com.personal.money.management.core.tax.application;

import com.personal.money.management.core.tax.infrastructure.persistence.DeductionBracketEntity;
import com.personal.money.management.core.tax.infrastructure.persistence.TaxBracketDetailEntity;
import com.personal.money.management.core.tax.infrastructure.persistence.TaxBracketEntity;
import com.personal.money.management.core.tax.infrastructure.persistence.WageZoneEntity;
import com.personal.money.management.core.tax.domain.service.DeductionBracketRepository;
import com.personal.money.management.core.tax.domain.service.TaxBracketDetailRepository;
import com.personal.money.management.core.tax.domain.service.TaxBracketRepository;
import com.personal.money.management.core.tax.domain.service.WageZoneRepository;
import com.personal.money.management.core.tax.interfaces.TaxConfigResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TaxConfigServiceTest {

    private TaxBracketRepository taxBracketRepository;
    private TaxBracketDetailRepository taxBracketDetailRepository;
    private DeductionBracketRepository deductionBracketRepository;
    private WageZoneRepository wageZoneRepository;
    private TaxConfigService taxConfigService;

    @BeforeEach
    void setUp() {
        taxBracketRepository = mock(TaxBracketRepository.class);
        taxBracketDetailRepository = mock(TaxBracketDetailRepository.class);
        deductionBracketRepository = mock(DeductionBracketRepository.class);
        wageZoneRepository = mock(WageZoneRepository.class);

        taxConfigService = new TaxConfigService(
                taxBracketRepository,
                taxBracketDetailRepository,
                deductionBracketRepository,
                wageZoneRepository
        );
    }

    @Test
    void getTaxConfig_shouldMapEntitiesToResponse() {
        TaxBracketEntity bracket = new TaxBracketEntity("id1", "7-bracket", "7 bậc", LocalDate.of(2025,12,13));
        TaxBracketDetailEntity detail = new TaxBracketDetailEntity("d1", bracket, 0L, 5000000L, 5.0, 0L, 1);
        bracket.setDetails(List.of(detail));

        DeductionBracketEntity ded = new DeductionBracketEntity("ded1", "old", "old label", 11000000L, 4400000L, LocalDate.of(2025,12,13));

        WageZoneEntity zone = new WageZoneEntity("w1","I","zone I",4960000L,99200000L, LocalDate.of(2025,12,1));

        when(taxBracketRepository.findAllOrderByEffectiveDate()).thenReturn(List.of(bracket));
        when(deductionBracketRepository.findAll()).thenReturn(List.of(ded));
        when(wageZoneRepository.findAll()).thenReturn(List.of(zone));

        TaxConfigResponse response = taxConfigService.getTaxConfig();

        assertNotNull(response);
        assertEquals(1, response.getTaxBrackets().size());
        assertEquals("7-bracket", response.getTaxBrackets().get(0).getValue());
        assertEquals(1, response.getTaxBrackets().get(0).getBrackets().size());

        assertEquals(1, response.getDeductionBrackets().size());
        assertEquals("old", response.getDeductionBrackets().get(0).getValue());

        assertEquals(1, response.getWageZones().size());
        assertEquals("I", response.getWageZones().get(0).getValue());

        verify(taxBracketRepository).findAllOrderByEffectiveDate();
        verify(deductionBracketRepository).findAll();
        verify(wageZoneRepository).findAll();
    }

    @Test
    void getTaxBracketByValue_notFound_shouldReturnNull() {
        when(taxBracketRepository.findByValue("nonexistent")).thenReturn(Optional.empty());

        var result = taxConfigService.getTaxBracketByValue("nonexistent");

        assertNull(result);
        verify(taxBracketRepository).findByValue("nonexistent");
    }

    @Test
    void createTaxBracket_shouldSaveAndReturnSuccessResponse() {
        TaxBracketRequest.TaxBracketDetailRequest dreq = new TaxBracketRequest.TaxBracketDetailRequest(0L, 5000000L, 5.0, 0L, 1);
        TaxBracketRequest req = new TaxBracketRequest("my-bracket", "label", LocalDate.of(2026,1,1), List.of(dreq));

        // Capture save call - we just return the passed entity
        when(taxBracketRepository.save(any(TaxBracketEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var resp = taxConfigService.createTaxBracket(req);

        assertTrue(resp.isSuccess());
        assertEquals("my-bracket", resp.getValue());
        verify(taxBracketRepository).save(any(TaxBracketEntity.class));
    }

    @Test
    void updateTaxBracket_whenNotFound_shouldReturnFailureResponse() {
        when(taxBracketRepository.findByValue("nope")).thenReturn(Optional.empty());

        TaxBracketRequest req = new TaxBracketRequest();
        req.setLabel("lbl");
        req.setEffectiveDate(LocalDate.of(2026,1,1));

        var resp = taxConfigService.updateTaxBracket("nope", req);

        assertFalse(resp.isSuccess());
        assertEquals("Tax bracket not found", resp.getMessage());
    }
}
