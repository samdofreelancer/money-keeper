package com.personal.money.management.core.account.infrastructure.persistence;

import com.personal.money.management.core.account.domain.model.Account;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AccountMapper {

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

    AccountEntity toEntity(Account account);
}
