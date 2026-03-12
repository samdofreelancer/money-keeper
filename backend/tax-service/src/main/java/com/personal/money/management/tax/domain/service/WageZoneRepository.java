package com.personal.money.management.tax.domain.service;

import com.personal.money.management.tax.infrastructure.persistence.WageZoneEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for WageZone entity
 */
@Repository
public interface WageZoneRepository extends JpaRepository<WageZoneEntity, String> {
    /**
     * Find wage zone by value code
     */
    Optional<WageZoneEntity> findByValue(String value);
    
    /**
     * Find all wage zones ordered by value
     */
    @Query("SELECT w FROM WageZoneEntity w ORDER BY w.value ASC")
    List<WageZoneEntity> findAllOrderByValue();
    
    /**
     * Delete all wage zones (useful for reset)
     */
    @Modifying
    @Query("DELETE FROM WageZoneEntity")
    void deleteAllZones();
}
