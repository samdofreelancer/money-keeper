package com.personal.money.management.tax.domain.service;

import com.personal.money.management.tax.infrastructure.persistence.TaxBracketDetailEntity;
import com.personal.money.management.tax.infrastructure.persistence.TaxBracketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Repository for TaxBracketDetail entity
 */
@Repository
public interface TaxBracketDetailRepository extends JpaRepository<TaxBracketDetailEntity, String> {
    /**
     * Delete all details for a specific tax bracket
     */
    void deleteByBracket(TaxBracketEntity bracket);
    
    /**
     * Delete all bracket details (useful for reset)
     */
    @Modifying
    @Query("DELETE FROM TaxBracketDetailEntity")
    void deleteAllDetails();
}
