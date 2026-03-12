package com.personal.money.management.tax.domain.service;

import com.personal.money.management.tax.infrastructure.persistence.DeductionBracketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for DeductionBracket entity
 */
@Repository
public interface DeductionBracketRepository extends JpaRepository<DeductionBracketEntity, String> {
    /**
     * Find deduction bracket by value code
     */
    Optional<DeductionBracketEntity> findByValue(String value);
    
    /**
     * Find the latest effective deduction bracket (by effective date)
     */
    @Query("SELECT d FROM DeductionBracketEntity d WHERE d.effectiveDate <= :date ORDER BY d.effectiveDate DESC")
    List<DeductionBracketEntity> findLatestEffectiveByDate(LocalDate date);
    
    /**
     * Find all deduction brackets ordered by effective date
     */
    @Query("SELECT d FROM DeductionBracketEntity d ORDER BY d.effectiveDate DESC")
    List<DeductionBracketEntity> findAllOrderByEffectiveDate();
    
    /**
     * Delete all deduction brackets (useful for reset)
     */
    @Modifying
    @Query("DELETE FROM DeductionBracketEntity")
    void deleteAllDeductions();
}
