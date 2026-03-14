package com.personal.money.management.core.account.infrastructure.persistence;

import com.personal.money.management.core.account.domain.model.Account;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AccountMapper {

    AccountEntity toEntity(Account account);

    // Keep the custom toDomain method as it uses Account.reconstruct()
    default Account toDomain(AccountEntity entity) {
        if (entity == null) {
            return null;
        }
        return Account.reconstruct(
                entity.getId(),
                entity.getAccountName(),
                entity.getInitBalance(),
                entity.getType(),
                entity.getCurrency(),
                entity.getDescription(),
                entity.isActive()
        );
    }

    List<Account> toDomainList(List<AccountEntity> entities);
    List<AccountEntity> toEntityList(List<Account> accounts);
}