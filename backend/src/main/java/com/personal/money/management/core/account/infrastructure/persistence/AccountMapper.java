package com.personal.money.management.core.account.infrastructure.persistence;

import com.personal.money.management.core.account.domain.model.Account;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AccountMapper {

    AccountMapper INSTANCE = Mappers.getMapper(AccountMapper.class);

    @Mapping(target = "id", source = "entity.id")
    @Mapping(target = "accountName", source = "entity.accountName")
    @Mapping(target = "initBalance", source = "entity.initBalance")
    @Mapping(target = "type", source = "entity.type")
    @Mapping(target = "currency", source = "entity.currency")
    @Mapping(target = "description", source = "entity.description")
    @Mapping(target = "active", source = "entity.active")
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
