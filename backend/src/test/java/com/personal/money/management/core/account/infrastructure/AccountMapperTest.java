package com.personal.money.management.core.account.infrastructure;

import com.personal.money.management.core.account.domain.model.Account;
import com.personal.money.management.core.account.domain.model.AccountType;
import com.personal.money.management.core.account.infrastructure.persistence.AccountEntity;
import com.personal.money.management.core.account.infrastructure.persistence.AccountMapper;
import com.personal.money.management.core.account.infrastructure.persistence.AccountMapperImpl;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class AccountMapperTest {
    private final AccountMapper mapper = new AccountMapperImpl();

    @Test
    void testMapperFunctionality() {
        // Test entity to domain mapping
        AccountEntity entity = new AccountEntity();
        entity.setId(1L);
        entity.setAccountName("Test Account");
        entity.setInitBalance(BigDecimal.valueOf(100));
        entity.setType(AccountType.CASH);
        entity.setCurrency("USD");
        entity.setDescription("Test Description");
        entity.setActive(true);

        Account domain = mapper.toDomain(entity);

        assertNotNull(domain);
        assertEquals(entity.getId(), domain.getId());
        assertEquals(entity.getAccountName(), domain.getAccountName());
        assertEquals(entity.getInitBalance(), domain.getInitBalance());

        // Test domain to entity mapping
        AccountEntity mappedEntity = mapper.toEntity(domain);

        assertNotNull(mappedEntity);
        assertEquals(domain.getId(), mappedEntity.getId());
        assertEquals(domain.getAccountName(), mappedEntity.getAccountName());
    }
}
