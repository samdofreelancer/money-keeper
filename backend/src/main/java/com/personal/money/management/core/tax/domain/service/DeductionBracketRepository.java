package com.personal.money.management.core.tax.domain.service;

import com.personal.money.management.core.tax.domain.model.DeductionBracketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for DeductionBracket entity
 */
@Repository
public interface DeductionBracketRepository extends JpaRepository<DeductionBracketEntity, String> {
}
