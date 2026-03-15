package com.personal.money.management.tax.domain.service;

import com.personal.money.management.tax.infrastructure.persistence.TaxBracketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for TaxBracket entity
 * Provides database access for tax bracket configurations
 */
@Repository
public interface TaxBracketRepository extends JpaRepository<TaxBracketEntity, String> {
    
    /**
     * Find a tax bracket by its value (e.g., "7-bracket", "5-bracket")
     */
    Optional<TaxBracketEntity> findByValue(String value);
    
    /**
     * Find all tax brackets ordered by effective date
     */
    @Query("SELECT t FROM TaxBracketEntity t ORDER BY t.effectiveDate DESC")
    List<TaxBracketEntity> findAllOrderByEffectiveDate();
    
    /**
     * Delete all tax brackets (useful for reset)
     */
    @Modifying
    @Query("DELETE FROM TaxBracketEntity")
    void deleteAllBrackets();
}
