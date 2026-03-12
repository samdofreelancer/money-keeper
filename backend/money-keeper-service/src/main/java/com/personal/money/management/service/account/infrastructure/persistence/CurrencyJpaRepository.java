package com.personal.money.management.service.account.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CurrencyJpaRepository extends JpaRepository<CurrencyEntity, Long> {
    boolean existsByCode(String code);
    CurrencyEntity findByCode(String code);
}
