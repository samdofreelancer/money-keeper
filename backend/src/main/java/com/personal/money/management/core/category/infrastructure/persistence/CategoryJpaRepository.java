package com.personal.money.management.core.category.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryJpaRepository extends JpaRepository<CategoryEntity, Long> {}