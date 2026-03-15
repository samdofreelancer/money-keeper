package com.personal.money.management.core.account.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CurrencyJpaRepository extends JpaRepository<CurrencyEntity, Long> {
    boolean existsByCode(String code);
    CurrencyEntity findByCode(String code);
}
