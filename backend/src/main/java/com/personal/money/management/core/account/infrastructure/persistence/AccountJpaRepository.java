package com.personal.money.management.core.account.infrastructure.persistence;

import com.personal.money.management.core.account.domain.model.AccountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountJpaRepository extends JpaRepository<AccountEntity, Long> {

    Optional<AccountEntity> findByAccountNameIgnoreCase(String accountName);

    // Additional useful queries
    List<AccountEntity> findByActiveTrue();
    List<AccountEntity> findByType(AccountType type);
    List<AccountEntity> findByCurrency(String currency);

    @Query("SELECT a FROM AccountEntity a WHERE a.accountName LIKE %:name%")
    List<AccountEntity> findByAccountNameContaining(@Param("name") String name);
}
