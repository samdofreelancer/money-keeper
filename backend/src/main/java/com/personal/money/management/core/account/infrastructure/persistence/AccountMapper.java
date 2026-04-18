package com.personal.money.management.core.account.infrastructure.persistence;

import com.personal.money.management.core.account.domain.model.Account;
import com.personal.money.management.core.shared.domain.valueobject.AccountName;
import com.personal.money.management.core.shared.domain.valueobject.CurrencyCode;
import com.personal.money.management.core.shared.domain.valueobject.Money;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AccountMapper {

    // Custom toEntity implementation since we need to convert VOs to primitives
    default AccountEntity toEntity(Account account) {
        if (account == null) {
            return null;
        }
        AccountEntity entity = new AccountEntity();
        entity.setId(account.getId());
        entity.setAccountName(account.getName().getValue());
        entity.setInitBalance(account.getInitialBalance().getAmount());
        entity.setCurrency(account.getInitialBalance().getCurrency().getCode());
        entity.setType(account.getType());
        entity.setDescription(account.getDescription());
        entity.setActive(account.isActive());
        return entity;
    }

    // Custom toDomain method that converts primitives to VOs
    default Account toDomain(AccountEntity entity) {
        if (entity == null) {
            return null;
        }
        return Account.reconstruct(
                entity.getId(),
                AccountName.of(entity.getAccountName()),
                Money.of(entity.getInitBalance(), CurrencyCode.of(entity.getCurrency())),
                entity.getType(),
                entity.getDescription(),
                entity.isActive()
        );
    }

    List<Account> toDomainList(List<AccountEntity> entities);

    default List<AccountEntity> toEntityList(List<Account> accounts) {
        if (accounts == null) {
            return null;
        }
        return accounts.stream()
                .map(this::toEntity)
                .toList();
    }
}