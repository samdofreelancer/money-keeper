package com.personal.money.management.core.tax.domain.service;

import com.personal.money.management.core.tax.domain.model.DeductionBracketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Repository for DeductionBracket entity
 */
@Repository
public interface DeductionBracketRepository extends JpaRepository<DeductionBracketEntity, String> {
    /**
     * Delete all deduction brackets (useful for reset)
     */
    @Modifying
    @Query("DELETE FROM DeductionBracketEntity")
    void deleteAllDeductions();
}
