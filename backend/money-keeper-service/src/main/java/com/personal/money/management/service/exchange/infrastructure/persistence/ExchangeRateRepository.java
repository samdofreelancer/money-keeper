package com.personal.money.management.service.exchange.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExchangeRateRepository extends JpaRepository<ExchangeRateEntity, Long> {
    List<ExchangeRateEntity> findByBaseAndRateDate(String base, LocalDate rateDate);
    List<ExchangeRateEntity> findByRateDate(LocalDate rateDate);
    void deleteByRateDate(LocalDate rateDate);
} 