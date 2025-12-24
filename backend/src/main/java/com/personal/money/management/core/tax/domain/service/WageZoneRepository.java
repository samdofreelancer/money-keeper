package com.personal.money.management.core.tax.domain.service;

import com.personal.money.management.core.tax.domain.model.WageZoneEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Repository for WageZone entity
 */
@Repository
public interface WageZoneRepository extends JpaRepository<WageZoneEntity, String> {
    /**
     * Delete all wage zones (useful for reset)
     */
    @Modifying
    @Query("DELETE FROM WageZoneEntity")
    void deleteAllZones();
}
