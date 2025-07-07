package com.personal.money.management.core.account.infrastructure.persistence;

import com.personal.money.management.core.account.domain.model.Account;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AccountMapper {

    AccountMapper INSTANCE = Mappers.getMapper(AccountMapper.class);

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

    @Mapping(target = "id", source = "account.id")
    AccountEntity toEntity(Account account);
}
