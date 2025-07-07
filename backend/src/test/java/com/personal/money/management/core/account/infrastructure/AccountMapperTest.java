package com.personal.money.management.core.account.infrastructure;

import com.personal.money.management.core.account.domain.model.Account;
import com.personal.money.management.core.account.domain.model.AccountType;
import com.personal.money.management.core.account.infrastructure.persistence.AccountEntity;
import com.personal.money.management.core.account.infrastructure.persistence.AccountMapper;
import com.personal.money.management.core.account.infrastructure.persistence.AccountMapperImpl;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

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
        assertEquals(entity.getType(), domain.getType());
        assertEquals(entity.getCurrency(), domain.getCurrency());
        assertEquals(entity.getDescription(), domain.getDescription());
        assertEquals(entity.isActive(), domain.isActive());

        // Test domain to entity mapping
        AccountEntity mappedEntity = mapper.toEntity(domain);

        assertNotNull(mappedEntity);
        assertEquals(domain.getId(), mappedEntity.getId());
        assertEquals(domain.getAccountName(), mappedEntity.getAccountName());
        assertEquals(domain.getInitBalance(), mappedEntity.getInitBalance());
        assertEquals(domain.getType(), mappedEntity.getType());
        assertEquals(domain.getCurrency(), mappedEntity.getCurrency());
        assertEquals(domain.getDescription(), mappedEntity.getDescription());
        assertEquals(domain.isActive(), mappedEntity.isActive());
    }

    @Test
    void testNullEntityToDomain() {
        Account domain = mapper.toDomain(null);
        assertNull(domain);
    }

    @Test
    void testBatchConversions() {
        AccountEntity entity1 = new AccountEntity();
        entity1.setId(1L);
        entity1.setAccountName("Account 1");
        entity1.setInitBalance(BigDecimal.valueOf(100));
        entity1.setType(AccountType.CASH);
        entity1.setCurrency("USD");
        entity1.setDescription("Desc 1");
        entity1.setActive(true);

        AccountEntity entity2 = new AccountEntity();
        entity2.setId(2L);
        entity2.setAccountName("Account 2");
        entity2.setInitBalance(BigDecimal.valueOf(200));
        entity2.setType(AccountType.BANK_ACCOUNT);
        entity2.setCurrency("EUR");
        entity2.setDescription("Desc 2");
        entity2.setActive(false);

        List<AccountEntity> entities = Arrays.asList(entity1, entity2);
        List<Account> domains = mapper.toDomainList(entities);

        assertNotNull(domains);
        assertEquals(2, domains.size());

        for (int i = 0; i < entities.size(); i++) {
            AccountEntity e = entities.get(i);
            Account d = domains.get(i);
            assertEquals(e.getId(), d.getId());
            assertEquals(e.getAccountName(), d.getAccountName());
            assertEquals(e.getInitBalance(), d.getInitBalance());
            assertEquals(e.getType(), d.getType());
            assertEquals(e.getCurrency(), d.getCurrency());
            assertEquals(e.getDescription(), d.getDescription());
            assertEquals(e.isActive(), d.isActive());
        }

        List<Account> emptyDomainList = Collections.emptyList();
        List<AccountEntity> emptyEntityList = mapper.toEntityList(emptyDomainList);
        assertNotNull(emptyEntityList);
        assertTrue(emptyEntityList.isEmpty());
    }
}
