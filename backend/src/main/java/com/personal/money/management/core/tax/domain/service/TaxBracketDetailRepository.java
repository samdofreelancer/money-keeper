package com.personal.money.management.core.tax.domain.service;

import com.personal.money.management.core.tax.domain.model.TaxBracketDetailEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for TaxBracketDetail entity
 */
@Repository
public interface TaxBracketDetailRepository extends JpaRepository<TaxBracketDetailEntity, String> {
}
