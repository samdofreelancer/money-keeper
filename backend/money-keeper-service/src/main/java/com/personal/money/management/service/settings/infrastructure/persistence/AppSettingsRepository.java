package com.personal.money.management.service.settings.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AppSettingsRepository extends JpaRepository<AppSettingsEntity, Long> {
} 