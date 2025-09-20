package com.personal.money.management.core.settings.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AppSettingsRepository extends JpaRepository<AppSettingsEntity, Long> {
} 