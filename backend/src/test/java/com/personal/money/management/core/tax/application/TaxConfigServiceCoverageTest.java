package com.personal.money.management.core.tax.application;

import com.personal.money.management.core.tax.infrastructure.persistence.DeductionBracketEntity;
import com.personal.money.management.core.tax.infrastructure.persistence.TaxBracketDetailEntity;
import com.personal.money.management.core.tax.infrastructure.persistence.TaxBracketEntity;
import com.personal.money.management.core.tax.infrastructure.persistence.WageZoneEntity;
import com.personal.money.management.core.tax.domain.service.DeductionBracketRepository;
import com.personal.money.management.core.tax.domain.service.TaxBracketDetailRepository;
import com.personal.money.management.core.tax.domain.service.TaxBracketRepository;
import com.personal.money.management.core.tax.domain.service.WageZoneRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaxConfigServiceCoverageTest {

    @Mock
    private TaxBracketRepository taxBracketRepository;

    @Mock
    private TaxBracketDetailRepository taxBracketDetailRepository;

    @Mock
    private DeductionBracketRepository deductionBracketRepository;

    @Mock
    private WageZoneRepository wageZoneRepository;

    @InjectMocks
    private TaxConfigService service;

    @Captor
    ArgumentCaptor<TaxBracketEntity> bracketCaptor;

    @Test
    void createTaxBracket_success_and_bracketOrderFallback() {
        TaxBracketRequest.TaxBracketDetailRequest detail = new TaxBracketRequest.TaxBracketDetailRequest(
                0L, 1000L, 5.0, 0L, null);

        TaxBracketRequest req = new TaxBracketRequest(
                "x-bracket",
                "label",
                LocalDate.of(2025, 12, 31),
                Collections.singletonList(detail));

        when(taxBracketRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        TaxBracketResponse resp = service.createTaxBracket(req);

        assertThat(resp).isNotNull();
        assertThat(resp.isSuccess()).isTrue();
        verify(taxBracketRepository, times(1)).save(bracketCaptor.capture());

        TaxBracketEntity saved = bracketCaptor.getValue();
        assertThat(saved.getValue()).isEqualTo("x-bracket");
        assertThat(saved.getDetails()).hasSize(1);
        // bracketOrder should fallback to 1
        assertThat(saved.getDetails().get(0).getBracketOrder()).isEqualTo(1);
    }

    @Test
    void updateTaxBracket_notFound_returnsFailure() {
        when(taxBracketRepository.findByValue("nope")).thenReturn(Optional.empty());

        TaxBracketRequest req = new TaxBracketRequest();
        req.setLabel("lbl");

        TaxBracketResponse resp = service.updateTaxBracket("nope", req);

        assertThat(resp).isNotNull();
        assertThat(resp.isSuccess()).isFalse();
        assertThat(resp.getMessage()).contains("not found");
        verify(taxBracketRepository, never()).save(any());
    }

    @Test
    void deleteTaxBracket_notFound_and_found() {
        when(taxBracketRepository.findByValue("missing")).thenReturn(Optional.empty());

        TaxBracketResponse r1 = service.deleteTaxBracket("missing");
        assertThat(r1.isSuccess()).isFalse();

        TaxBracketEntity ent = new TaxBracketEntity("id", "val", "lbl", LocalDate.of(2025, 1, 1));
        when(taxBracketRepository.findByValue("val")).thenReturn(Optional.of(ent));

        TaxBracketResponse r2 = service.deleteTaxBracket("val");
        assertThat(r2.isSuccess()).isTrue();
        verify(taxBracketRepository).delete(ent);
    }

    @Test
    void getTaxBracketByValue_notFound_and_found() {
        when(taxBracketRepository.findByValue("x")).thenReturn(Optional.empty());
        assertThat(service.getTaxBracketByValue("x")).isNull();

        TaxBracketEntity ent = new TaxBracketEntity("id", "value", "label", LocalDate.of(2025, 6, 1));
        TaxBracketDetailEntity d = new TaxBracketDetailEntity("did", ent, 0L, 10L, 5.0, 0L, 1);
        ent.setDetails(List.of(d));

        when(taxBracketRepository.findByValue("value")).thenReturn(Optional.of(ent));

        var opt = service.getTaxBracketByValue("value");
        assertThat(opt).isNotNull();
        assertThat(opt.getValue()).isEqualTo("value");
        assertThat(opt.getBrackets()).hasSize(1);
    }

    @Test
    void resetToDefaults_calls_repository_methods_and_returnsMessage() {
        // No behaviour needed; we just verify interactions
        doNothing().when(taxBracketDetailRepository).deleteAllDetails();
        doNothing().when(taxBracketRepository).deleteAllBrackets();
        doNothing().when(deductionBracketRepository).deleteAllDeductions();
        doNothing().when(wageZoneRepository).deleteAllZones();

        when(taxBracketRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(deductionBracketRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(wageZoneRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        String msg = service.resetToDefaults();
        assertThat(msg).isNotBlank();

        // verify that save was called at least a few times to insert defaults
        verify(taxBracketRepository, atLeast(2)).save(any());
        verify(deductionBracketRepository, atLeast(1)).save(any(DeductionBracketEntity.class));
        verify(wageZoneRepository, atLeast(1)).save(any(WageZoneEntity.class));
    }
}
